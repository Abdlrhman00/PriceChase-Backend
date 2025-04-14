import time
import json
import sys
import requests
import random
import os
from bs4 import BeautifulSoup
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager
from selenium.webdriver.chrome.options import Options

# Rotating user-agents
USER_AGENTS = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/98.0.4758.102 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.107 Safari/537.36",
    "Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:89.0) Gecko/20100101 Firefox/89.0"
]

# Append product data to JSON file
def append_to_json(file_path, new_data):
    """Append new data to an existing JSON file or create it if it doesn't exist."""
    # if os.path.exists(file_path):
    #     with open(file_path, 'r', encoding='utf-8') as file:
    #         try:
    #             data = json.load(file)
    #         except json.JSONDecodeError:
    #             data = []
    # else:
    #     data = []
    data = []
    data.append(new_data)  # Add single product data

    with open(file_path, 'w', encoding='utf-8') as file:
        json.dump(data, file, ensure_ascii=False, indent=4)

# Fetch product details
def fetch_product_details(product_url, product_id):
    """Fetch product details for a single product and save to JSON without modifying existing content."""
    session = requests.Session()
    headers = {
        'User-Agent': random.choice(USER_AGENTS),
        'Accept-Language': 'en-US,en;q=0.9',
        'Referer': 'https://www.google.com/',
    }
    session.headers.update(headers)

    response = session.get(product_url)
    
    if response.status_code == 200:
        soup = BeautifulSoup(response.text, 'html.parser')
        json_data_element = soup.find('script', id="__NEXT_DATA__")

        if json_data_element:
            json_data = json.loads(json_data_element.string)

            product_info = {}

            # Safely access product title
            product_info['Title'] = json_data['props']['pageProps']['initialData']['data']['product'].get('name', 'N/A')
            
            product_info['Id'] = json_data['props']['pageProps']['initialData']['data']['product'].get('id', 'N/A')
            # Safely access price information
            price_info = json_data['props']['pageProps']['initialData']['data']['product'].get('priceInfo', {})
            product_info['Price'] = price_info.get('currentPrice', {}).get('price', 'N/A')
            product_info['Currency'] = price_info.get('currentPrice', {}).get('currencyUnit', 'N/A')

            # Safely access description
            product_info['Description'] = json_data['props']['pageProps']['initialData']['data'].get('idml', {}).get('shortDescription', 'N/A')

            # Safely access availability
            product_info['Availability'] = json_data['props']['pageProps']['initialData']['data']['product'].get('availabilityStatus', 'N/A')

            # Safely access average rating
            reviews_info = json_data['props']['pageProps']['initialData']['data'].get('reviews', {})
            product_info['AverageRating'] = reviews_info.get('roundedAverageOverallRating', 'N/A')

            # Add the product URL and image URL
            product_info['ProductPage'] = product_url
            product_info['Image'] = json_data['props']['pageProps']['initialData']['data']['product']['imageInfo'].get('thumbnailUrl', 'N/A')

            # Extract reviews if available
            reviews_data = reviews_info.get('customerReviews', [])
            product_info['TopReviews'] = [{'ReviewText': review.get('reviewText', ''), 'Rating': review.get('rating', '')} for review in reviews_data]

            # Get the current directory
            current_dir = os.getcwd()

            # Join the current directory with the relative path
            file_path = os.path.join(current_dir, "data", f"{product_id}_product.json")
            print("File path", file_path)
            # Call the function with the full path
            append_to_json(file_path, product_info)
            #append_to_json(f"..data/{product_info['Title']}product.json", product_info)
            print(f"Product details saved to", file_path)
        
        else:
            print(f"JSON data element not found for: {product_url}. Trying Selenium...")
            #return fetch_product_with_selenium(product_url)
    
    else:
        print(f"❌ Failed to retrieve product data. Status code: {response.status_code} for {product_url}. Trying Selenium...")
        #return fetch_product_with_selenium(product_url)

    # Random delay to avoid detection
    time.sleep(random.uniform(1, 3))

# # Selenium fallback if requests fail
# def fetch_product_with_selenium(product_url):
#     """Use Selenium to fetch product details if requests are blocked."""
#     chrome_options = Options()
#     chrome_options.add_argument("--headless")
#     chrome_options.add_argument("--disable-blink-features=AutomationControlled")
#     chrome_options.add_argument("--no-sandbox")
#     chrome_options.add_argument("--disable-dev-shm-usage")

#     driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()), options=chrome_options)
    
#     try:
#         driver.get(product_url)
#         time.sleep(random.uniform(3, 5))  # Wait for JS to load
#         soup = BeautifulSoup(driver.page_source, 'html.parser')
#         json_data_element = soup.find('script', id="__NEXT_DATA__")

#         if json_data_element:
#             json_data = json.loads(json_data_element.string)

#             product_info = {
#                 'StoreName': 'walmart',
#                 'Category': 'Girl',
#                 'SubCategory': 'Jeans',
#             }

#             # Safely access product title
#             product_info['Title'] = json_data['props']['pageProps']['initialData']['data']['product'].get('name', 'N/A')

#             # Safely access price information
#             price_info = json_data['props']['pageProps']['initialData']['data']['product'].get('priceInfo', {})
#             product_info['Price'] = price_info.get('currentPrice', {}).get('price', 'N/A')
#             product_info['Currency'] = price_info.get('currentPrice', {}).get('currencyUnit', 'N/A')

#             # Safely access description
#             product_info['Description'] = json_data['props']['pageProps']['initialData']['data'].get('idml', {}).get('shortDescription', 'N/A')

#             # Safely access availability
#             product_info['Availability'] = json_data['props']['pageProps']['initialData']['data']['product'].get('availabilityStatus', 'N/A')

#             # Safely access average rating
#             reviews_info = json_data['props']['pageProps']['initialData']['data'].get('reviews', {})
#             product_info['AverageRating'] = reviews_info.get('roundedAverageOverallRating', 'N/A')

#             # Add the product URL and image URL
#             product_info['ProductPage'] = product_url
#             product_info['Image'] = json_data['props']['pageProps']['initialData']['data']['product']['imageInfo'].get('thumbnailUrl', 'N/A')

#             # Extract reviews if available
#             reviews_data = reviews_info.get('customerReviews', [])
#             product_info['TopReviews'] = [{'ReviewText': review.get('reviewText', ''), 'Rating': review.get('rating', '')} for review in reviews_data]

#             append_to_json('product_info.json', product_info)
#             print(f"✅ Product details saved to 'product_info.json' via Selenium.")
#         else:
#             print(f"⚠️ JSON data element not found using Selenium for: {product_url}")

#     finally:
#         driver.quit()

# Example usage:
#product_url = "https://www.walmart.com/ip/Wrangler-Men-s-and-Big-Men-s-Multi-Pocket-Cargo-Short-with-Stretch-Sizes-30-50/1669821720?classType=VARIANT"
#fetch_product_details(product_url)


if __name__ == "__main__":
    product_url = sys.argv[1]
    product_id = sys.argv[2]
    print("indside the script",product_url)
    fetch_product_details(product_url, product_id)
