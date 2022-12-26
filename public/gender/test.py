import librosa
import numpy as np
import pickle

def extract_feature(file_name, **kwargs):
    """
    Extract feature from audio file `file_name`
            - MEL Spectrogram Frequency (mel)
    """
    mel = kwargs.get("mel")
    X, sample_rate = librosa.core.load(file_name)
    result = np.array([])
    if mel:
        mel = np.mean(librosa.feature.melspectrogram(X, sr=sample_rate).T,axis=0)
        result = np.hstack((result, mel))
    return result

def detect_gender(req_id):
    file = 'public/uploads/in/' + req_id + '.wav'
    # load the model
    with open("public/gender/results/model.pkl", "rb") as model_file:
        model = pickle.load(model_file)

    features = extract_feature(file, mel=True).reshape(1, -1)
    # predict the gender!
    male_prob = model.predict(features)
    female_prob = 1 - male_prob
    gender = "male" if male_prob > female_prob else "female"
    # show the result!
    return gender