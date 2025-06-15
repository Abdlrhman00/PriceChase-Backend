from flask import Flask, request, jsonify
import tensorflow as tf
from PIL import Image
import numpy as np

app = Flask(__name__)

model = tf.keras.models.load_model('./ml-server/model.h5')

class_names = {
    0: 'Capris',
    1: 'Dresses',
    2: 'Jackets',
    3: 'Jeans',
    4: 'Leggings',
    5: 'Shirts',
    6: 'Shorts',
    7: 'Sweatshirts',
    8: 'Pants',
    9: 'Trousers',
    10: 'T-shirts'
}

@app.route('/')
def home():
    return "Flask ML server is running"

@app.route('/predict', methods=['POST'])
def predict():
    try:
        file = request.files['image']
        img = Image.open(file.stream)
        img = img.resize((224, 224))
        img = np.array(img) / 255.0
        img = img.reshape(1, 224, 224, 3)

        prediction = model.predict(img)
        predicted_class = int(np.argmax(prediction))

        result = {
            'prediction': predicted_class,
            'label': class_names.get(predicted_class, 'Unknown')
        }
        print(result)
        return jsonify(result)

    except Exception as e:
        print(f"Error during prediction: {e}")
        return jsonify({'error': 'Prediction failed', 'message': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5050)
