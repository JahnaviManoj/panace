import numpy as np
from sklearn.model_selection import train_test_split

# male is 1, female is 0
label2int = {
    "male" : 1,
    "female" : 0
}

def load_data():
    X = np.load("results/features.npy")
    y = np.load("results/labels.npy")
    return X, y

def split_data(X, y, test_size = 0.1, valid_size = 0.1):
    '''to split dataset into training, testing, validation sets'''

    #split training set and testing set
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=test_size, random_state=7)
    # split training set and validation set
    X_train, X_valid, y_train, y_valid = train_test_split(X_train, y_train, test_size=valid_size, random_state=7)
    # return a dictionary of values
    return {
        "X_train": X_train,
        "X_valid": X_valid,
        "X_test": X_test,
        "y_train": y_train,
        "y_valid": y_valid,
        "y_test": y_test
    }