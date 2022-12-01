from logging import exception
from time import sleep
import pymongo
from fileinput import filename
import speech_recognition as sr
from public.gender.test import detect_gender

client = pymongo.MongoClient("mongodb://localhost:27017/")
mydb = client["speech2text2"]
mycollection = mydb["stts"]

try:
  client.server_info()
  print("Connection Successfull")
except exception as e:
  print(e)

def stt(req_id):
    r = sr.Recognizer()

    filename = "public/uploads/in/" + req_id + ".wav"

    with sr.AudioFile(filename) as source:
        audio_data = r.record(source)
        text = r.recognize_google(audio_data)
        
        save_path = 'public/uploads/out/'
        file_name = req_id + ".txt"

        completeName = save_path + file_name

        file1 = open(completeName, "w")
        file1.write(text)
        file1.close()

while(True):
    sleep(3)
    print("Scanning database for speech to text")
    myquery = {"status" : "new"}
    myrequests = mycollection.find(myquery)

    for request in myrequests:
        print(request)
        stt(request["fileid"])
        gender = detect_gender(request["fileid"])
        mycollection.update_one({"_id":request['_id']},{"$set":{"status":"completed", "gender":gender}})