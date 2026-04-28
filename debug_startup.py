import sys
import os

print(f"Python executable: {sys.executable}")

try:
    import flask
    print("Flask imported")
except ImportError as e:
    print(f"Failed to import Flask: {e}")

try:
    import numpy
    print("numpy imported")
except ImportError as e:
    print(f"Failed to import numpy: {e}")

try:
    import pandas
    print("pandas imported")
except ImportError as e:
    print(f"Failed to import pandas: {e}")

try:
    import sklearn
    from sklearn.tree import DecisionTreeClassifier
    print("sklearn imported")
except ImportError as e:
    print(f"Failed to import sklearn: {e}")

try:
    import pickle
    model_path = "algo_model.pkl"
    if os.path.exists(model_path):
        with open(model_path, "rb") as f:
            model = pickle.load(f)
        print("Model loaded successfully")
        print(f"Model type: {type(model)}")
    else:
        print("algo_model.pkl not found")
except Exception as e:
    print(f"Failed to load model: {e}")

try:
    from app import app
    print("App imported successfully")
except Exception as e:
    print(f"Failed to import app: {e}")
