from flask import Flask, render_template, request, Markup
from tensorflow.keras.models import load_model
import pandas as pd 
import numpy as np 
from pathlib import Path
import string
import re
import joblib
import json
from collections import Counter
import nltk
from nltk.corpus import stopwords
from nltk.stem import WordNetLemmatizer

from tensorflow.keras.preprocessing.text import Tokenizer
from tensorflow.keras.preprocessing.sequence import pad_sequences

import speech_recognition as sr

lemmatizer = WordNetLemmatizer()
nltk.download('wordnet')

#from chatterbot import ChatBot
#from chatterbot.trainers import ChatterBotCorpusTrainer

def get_text(msg):
    input_text  = msg
    input_text = [input_text]
    df_input = pd.DataFrame(input_text,columns=['questions'])
    df_input
    return df_input 



def tokenizer(entry):
    tokens = entry.split()
    re_punc = re.compile('[%s]' % re.escape(string.punctuation))
    tokens = [re_punc.sub('', w) for w in tokens]
    tokens = [word for word in tokens if word.isalpha()]
    tokens = [lemmatizer.lemmatize(w.lower()) for w in tokens]
    stop_words = set(stopwords.words('english'))
    tokens = [w for w in tokens if not w in stop_words]
    tokens = [word.lower() for word in tokens if len(word) > 1]
    return tokens

def remove_stop_words_for_input(tokenizer,df,feature):
    doc_without_stopwords = []
    entry = df[feature][0]
    tokens = tokenizer(entry)
    doc_without_stopwords.append(' '.join(tokens))
    df[feature] = doc_without_stopwords
    return df

def encode_input_text(tokenizer_t,df,feature):
    t = tokenizer_t
    entry = entry = [df[feature][0]]
    encoded = t.texts_to_sequences(entry)
    padded = pad_sequences(encoded, maxlen=11, padding='post')
    return padded

def get_pred(model,encoded_input):
    pred = np.argmax(model.predict(encoded_input))
    return pred

def bot_precausion(df_input,pred):
    vocab = joblib.load(r'D:\Desktop\IGDTUWSmartBot2\vocab.pkl')
    words = df_input.questions[0].split()
    if len([w for w in words if w in vocab])==0 :
        pred = 1
    return pred

def get_response(df2,pred):
    upper_bound = df2.groupby('labels').get_group(pred).shape[0]
    r = np.random.randint(0,upper_bound)
    responses = list(df2.groupby('labels').get_group(pred).response)
    return responses[r]

app = Flask(__name__)


@app.route("/")
def home():
    return render_template("index.html")

@app.route("/get")
def get_bot_response():
    model = load_model(r"D:\Desktop\IGDTUWSmartBot2\model-v1.h5")

    userText = request.args.get('msg')
    df_input = get_text(userText)

    df2 = pd.read_csv(r"D:\Desktop\IGDTUWSmartBot2\response.csv")
    #load artifacts
    tokenizer_t = joblib.load(r'D:\Desktop\IGDTUWSmartBot2\tokenizer_t.pkl')
    vocab = joblib.load(r'D:\Desktop\IGDTUWSmartBot2\vocab.pkl')

    df_input = remove_stop_words_for_input(tokenizer,df_input,'questions')
    encoded_input = encode_input_text(tokenizer_t,df_input,'questions')  

    pred = get_pred(model,encoded_input)
    pred = bot_precausion(df_input,pred)

    response = get_response(df2,pred)

    return Markup(str(response))

@app.route("/voice")
def speech_recog():
    r = sr.Recognizer()
	# use the microphone as source for input.
    with sr.Microphone() as source2:
    
		# wait for a second to let the recognizer
		# adjust the energy threshold based on
		# the surrounding noise level
        r.adjust_for_ambient_noise(source2, duration=0.2)

		# listens for the user's input
        audio2 = r.listen(source2)

		# Using google to recognize audio
        MyText = r.recognize_google(audio2)
        MyText = MyText.lower()
        return str(MyText)
    


if __name__ == "__main__":
    app.run(debug=True)
