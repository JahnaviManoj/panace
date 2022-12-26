import pickle
from utils import load_data, split_data

# load the dataset
X, y = load_data()
# split the data into training, validation and testing sets
data = split_data(X, y, test_size=0.06, valid_size=0.06) #95% accuracy

from sklearn.ensemble import RandomForestClassifier
from sklearn import metrics
rand_forest = RandomForestClassifier()
rand_forest.fit(data["X_train"],data["y_train"])

with open("model.pkl", "wb") as file:
    pickle.dump(rand_forest, file)

y_pred1=rand_forest.predict(data["X_test"])
print(metrics.accuracy_score(data["y_test"],y_pred1))