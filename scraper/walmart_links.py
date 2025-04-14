import time
import json
import requests
import random
import re
import os
from bs4 import BeautifulSoup

# List of User-Agents for rotation
USER_AGENTS = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36",
]

# Walmart Session Cookies (Extract manually from browser after logging in)
SESSION_COOKIES = {
    'walmart_session': 'YOUR_SESSION_COOKIE_HERE',
}

def get_html(url):
    """Fetch the page source with randomized headers & delays."""
    headers = {
        'User-Agent': random.choice(USER_AGENTS),
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Referer': 'https://www.walmart.com/',
        'Connection': 'keep-alive',
    }

    try:
        response = requests.get(url, headers=headers, cookies=SESSION_COOKIES, timeout=10)
        if "Robot or human?" in response.text:
            print(f"⚠️ Detected as bot! Retrying {url}...")
            time.sleep(random.uniform(3, 6))
            return None  # Skip if blocked
        return response.text
    except requests.RequestException as e:
        print(f"❌ Request failed: {e}")
        return None

def get_json_data(subcategory_url):
    """Extract product links from Walmart subcategory page."""
    product_links = set()
    page_number = 1
    max_pages = 2  # Default

    while page_number <= max_pages:
        # Check if 'page=' exists in the URL, otherwise append it correctly
        if 'page=' in subcategory_url:
            url = re.sub(r'page=\d+', f'page={page_number}', subcategory_url)
        else:
            url = f"{subcategory_url}?page={page_number}"  # Append page number correctly

        print(f"📖 Scraping page {page_number}: {url}")

        html = get_html(url)
        if not html:
            print(f"🚨 Skipping {url} due to bot detection.")
            page_number += 1
            continue

        soup = BeautifulSoup(html, "html.parser")
        json_data_element = soup.find('script', id="__NEXT_DATA__")

        if json_data_element:
            try:
                json_data = json.loads(json_data_element.string)
                
                # Extract total pages dynamically
                pagination = json_data['props']['pageProps']['initialData']['searchResult'].get('paginationV2', {})
                max_pages = min(max_pages, pagination.get('maxPage', max_pages))

                # Extract product links
                items = json_data['props']['pageProps']['initialData']['searchResult']['itemStacks']
                for stack in items:
                    for link in stack['items']:
                        if link['__typename'] == 'Product':
                            full_link = 'https://www.walmart.com' + link['canonicalUrl']
                            product_links.add(full_link)
            except (json.JSONDecodeError, KeyError) as e:
                print(f"⚠️ JSON parsing error on page {page_number}: {e}")

        page_number += 1
        time.sleep(random.uniform(2, 5))  # Random delay to prevent blocking

    print(f"✅ Found {len(product_links)} product links.")
    return product_links

def append_to_json(file_path, new_data):
    """Append new data to an existing JSON file or create it if it doesn't exist."""
    if os.path.exists(file_path):
        with open(file_path, 'r', encoding='utf-8') as file:
            try:
                data = json.load(file)
            except json.JSONDecodeError:
                data = []
    else:
        data = []

    data.extend(new_data)

    with open(file_path, 'w', encoding='utf-8') as file:
        json.dump(data, file, ensure_ascii=False, indent=4)

def fetch_product_details(product_links):
    """Fetch product details for each link and save to JSON without modifying existing content."""
    all_product_info = []

    for url in product_links:
        print(f"🔍 Fetching product details: {url}")
        
        html = get_html(url)
        if not html:
            print(f"🚨 Skipping {url} due to bot detection.")
            continue

        soup = BeautifulSoup(html, 'html.parser')
        json_data_element = soup.find('script', id="__NEXT_DATA__")

        if json_data_element:
            try:
                json_data = json.loads(json_data_element.string)

                product_info = {
                    'StoreName': 'Walmart',
                    'Category': 'Girl',
                    'SubCategory': 'Jeans',
                }

                # Safely access product title
                product_info['Title'] = json_data['props']['pageProps']['initialData']['data']['product'].get('name', 'N/A')

                # Safely access price information
                price_info = json_data['props']['pageProps']['initialData']['data']['product'].get('priceInfo')
                if price_info:
                    current_price_info = price_info.get('currentPrice')
                    if current_price_info:
                        product_info['Price'] = current_price_info.get('price', 'N/A')
                        product_info['Currency'] = current_price_info.get('currencyUnit', 'N/A')
                    else:
                        product_info['Price'] = 'N/A'
                else:
                    product_info['Price'] = 'N/A'

                # Safely access description
                product_info['Description'] = json_data['props']['pageProps']['initialData']['data'].get('idml', {}).get('shortDescription', 'N/A')

                # Safely access availability
                product_info['Availability'] = json_data['props']['pageProps']['initialData']['data']['product'].get('availabilityStatus', 'N/A')

                # Safely access average rating
                reviews_info = json_data['props']['pageProps']['initialData']['data'].get('reviews', {})
                product_info['AverageRating'] = reviews_info.get('roundedAverageOverallRating', 'N/A')

                # Add the product URL and image URL
                product_info['ProductPage'] = url
                product_info['Image'] = json_data['props']['pageProps']['initialData']['data']['product']['imageInfo'].get('thumbnailUrl', 'N/A')

                # Extract reviews if available
                reviews_data = reviews_info.get('customerReviews', [])
                product_info['TopReviews'] = [{'ReviewText': review.get('reviewText', ''),
                                               'Rating': review.get('rating', '')} for review in reviews_data]

                all_product_info.append(product_info)
            except (json.JSONDecodeError, KeyError) as e:
                print(f"⚠️ Error extracting product details: {e}")

        # Add a delay before fetching the next product
        #time.sleep(random.uniform(2, 5))

    # Append all product information to JSON file
    append_to_json('walmart_products_".json', all_product_info)
    print(f"✅ All product details saved to 'product_info.json'.")

# Example usage
subcategory_url = "https://www.walmart.com/browse/clothing/girls-jeans/5438_7712430_1660851_2500436_2814775"
product_links = get_json_data(subcategory_url)

if product_links:
    fetch_product_details(product_links)
