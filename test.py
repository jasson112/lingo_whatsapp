# importing the required libraries
import gspread
import pandas as pd
from oauth2client.service_account import ServiceAccountCredentials
import smtplib
import os
from dotenv import load_dotenv
import pandas as pd
import numpy as np
import seaborn as sns
import matplotlib.pyplot as plt

import webbrowser
from selenium import webdriver
import urllib
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.wait import WebDriverWait
from selenium.webdriver.chrome.options import Options
from tqdm import notebook
import time
import pywhatkit
from selenium.common.exceptions import UnexpectedAlertPresentException
import random

load_dotenv()

# define the scope
scope = ['https://spreadsheets.google.com/feeds','https://www.googleapis.com/auth/drive']

# add credentials to the account
creds = ServiceAccountCredentials.from_json_keyfile_name('./lingo.json', scope)

# authorize the clientsheet 
client = gspread.authorize(creds)

# get the instance of the Spreadsheet
sheet = client.open('whatstest')

# get the first sheet of the Spreadsheet
sheet_instance = sheet.get_worksheet(0)

# get all the records of the data
records_data = sheet_instance.get_all_records()

#print(records_data)

#records_data = list(map(lambda num: num[0], records_data))
  
#print(records_data)

#pywhatkit.sendwhatmsg_instantly("573006624294", "Hi", 20, False, 20)



def element_presence(by, xpath, time):
    element_present = EC.presence_of_element_located((By.XPATH, xpath))
    WebDriverWait(driver, time).until(element_present)

def send_message(url):
    driver.get(url)
    #time.sleep(4)
    #mssagebox
    #//*[@id="main"]/div[3]/div/div[2]/div[3]/div[33]/div/div/div/div[1]/div/span[1]/span/strong
    element_presence(By.XPATH, '//*[@id="main"]/footer/div[1]/div/span[2]/div/div[2]/div[1]/div/div[2]', 100)
    msg_box = driver.find_element(By.XPATH, '//*[@id="main"]/footer/div[1]/div/span[2]/div/div[2]/div[1]/div/div[2]')
    msg_box.send_keys('\n')
    time.sleep(1)

def prepare_msg(dataframe, name_col, phone_col):
    file = dataframe[[name_col, phone_col]]
    base_msg = """
    *Buenas tardes {}!! 123*

Queremos conocer tu opinión sobre la aplicación Lingochamp Colombia, para lo cual te agradecemos si puedes enviarnos un vídeo corto indicándonos:

-Tu nombre completo 
-Tu centro de aprendizaje 
-Tu experiencia con la aplicación
- Una invitación a otras personas a hacer uso de la aplicación 

Al compartirnos tu vídeo estás autorizando el uso de derechos de imagen sobre fotografías y fijaciones audiovisuales (Videos) y de propiedad intelectual a AMEE S.A.S - Lingochamp Colombia

Si deseas obtener más información al respecto háznoslo saber por este medio.

Muchas gracias de antemano!

Buena tarde!

Equipo LingoChamp Colombia
"""
    base_url = 'https://web.whatsapp.com/send?phone=+57{}&text={}'
    # x = range(100)
    # failed = []
    # for n in x:
    #   try:
    #     phone_no = random.choice(['3042174023', '3006624294'])
    #     Name = 'Nuevo{}'.format(n)
    #     msg = urllib.parse.quote(base_msg.format(Name))
    #     url_msg = base_url.format(phone_no, msg)
    #     send_message(url_msg)
    #   except UnexpectedAlertPresentException:
    #     print('phone not sended')
    #     print(phone_no)
    
    # while failed:
    #   try:
    #     phone_no = n
    #     Name = 'Nuevo{}'.format(index)
    #     msg = urllib.parse.quote(base_msg.format(Name))
    #     url_msg = base_url.format(phone_no, msg)
    #     send_message(url_msg)
    #     failed.pop(0)
    #   except UnexpectedAlertPresentException:
    #     print('phone not sended')
    #     print(phone_no)
    
    for i,j in notebook.tqdm(file.iterrows()):
        try:
          phone_no = j[phone_col]
          Name = j[name_col].title()
          msg = urllib.parse.quote(base_msg.format(Name))
          url_msg = base_url.format(phone_no, msg)
          send_message(url_msg)
        except UnexpectedAlertPresentException:
          print('phone not sended')
          print(j[phone_col])

options = Options()
options.add_experimental_option("debuggerAddress", "127.0.0.1:9222")
options.add_argument('--headless')
options.add_argument('--disable-gpu')  # Last I checked this was necessary.
options.add_argument("--disable-extensions")
options.add_argument("--disable-dev-shm-usage")
options.add_argument("--no-sandbox")
options.headless = True
driver = webdriver.Chrome(executable_path="./chromedriver.exe", options=options)
dummy2 = pd.DataFrame(sheet_instance.get_all_records())
#dummy2 = {'Name':['NUEVO2', 'NUEVO'], 'Phone': ['3042174023', '3134945301']}  
prepare_msg(pd.DataFrame(dummy2), 'Name', 'Phone')
print(driver.title)