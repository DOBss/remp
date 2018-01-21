import os
import re
from datetime import datetime, date
from pydrive.auth import GoogleAuth
from pydrive.drive import GoogleDrive

import argparse
import requests
import os
import oauth2client

from apiclient.discovery import build
from oauth2client.service_account import ServiceAccountCredentials

import httplib2
from oauth2client import client
from oauth2client import file
from oauth2client import tools


def download_pageviesws_from_drive()

#authorization

def getService(apiName, apiVersion, scope, keyFileLocation,
               serviceAccountEmail):
  credentials = ServiceAccountCredentials.from_p12_keyfile(
      serviceAccountEmail, keyFileLocation, scopes=scope)
  http = credentials.authorize(httplib2.Http())
  service = build(apiName, apiVersion, http=http)
  return service

#selecting the correct GA profile / property

def getProfileId(service,account,property):
    profiles = service.management().profiles().list(
        accountId=account,
        webPropertyId=property).execute()
    if profiles.get('items'):
        # return the first view (profile) id.
        return profiles.get('items')[0].get('id')
    return None

#query for realtime API

def getResults(service, profileId):
   return service.data().realtime().get(
      ids='ga:' + profileId,
      metrics='rt:activeUsers',
      dimensions='rt:pagePath').execute()

#GA flow

def mainGA(account,profileId):
  scope = ['https://www.googleapis.com/auth/analytics.readonly']
  serviceAccountEmail = 'garealtime@realtimedummy.iam.gserviceaccount.com'
  keyFileLocation = 'C:/Users/RoMaN/Documents/GitHub/realTimeGANotif/realTimeDummy-5066ba918b6d.p12'
  service = getService('analytics', 'v3', scope, keyFileLocation,serviceAccountEmail)
  profile = getProfileId(service,account,profileId)
  return getResults(service, profile)

#function for sending alerts

def sendAlert(resultString,threshold):
    return requests.post(
        "https://api.mailgun.net/v3/sandboxe2f8bf6dc5de41bc9c9e186d5e7ed892.mailgun.org/messages",
        auth=("api", "key-3fabe768c99cce30bd43dbd70bb3cc9a"),
        data={"from": "Mailgun Sandbox <postmaster@sandboxe2f8bf6dc5de41bc9c9e186d5e7ed892.mailgun.org>",
              "to": "Roman Gavuliak <roman.gavuliak@gmail.com>",
              "subject": "Real Time Google Analytics Traffic Alert",
              "text": "Hello User, \n The following URLs attracted traffic more than " + threshold + " active user(s) \n " + resultString})

#functions for drive access & modification

def updateTimestamp():
    fileList = drive.ListFile({'q': "title contains 'timestampLastEmail' and trashed=false"}).GetList()
    if len(fileList) != 0:
        timestamp = fileList[0]['title']
        timestamp = re.sub("timestampLastEmail\|","",timestamp)
        timestamp = re.sub("\.txt","",timestamp)
        timestamp = datetime.strptime(timestamp, '%Y-%m-%d|%H:%M:%S')
        currentTime = datetime.now()
        timeDiff = currentTime - timestamp
        timeDiff = timeDiff.seconds / 60
        if(timeDiff > 5):
            fileList[0].Delete()
            tsfile = drive.CreateFile({'title': 'timestampLastEmail|' + re.sub(" ","|",re.sub("\.[0-9]*","",str(datetime.now()))) + ".txt","parents": [{"kind": "drive#fileLink","id": "0B6FRUt5Xhb_LWlYycTdST0lZV0E"}]})  # Create GoogleDriveFile instance with title 'Hello.txt'.
            tsfile.Upload()
            return True
        else:
            return False

#function for extracting the notification threshold

def getThreshold():
    thresholdFile = drive.ListFile({'q': "title contains 'threshold:' and trashed=false"}).GetList()
    if len(thresholdFile) == 0:
        tsfile = drive.CreateFile({'title': "threshold:10", "parents": [{"kind": "drive#fileLink","id": "0B6FRUt5Xhb_LWlYycTdST0lZV0E"}]})  # Create GoogleDriveFile instance with title 'Hello.txt'.
        #file1.SetContentString('filler')  # Set content of the file from given string.
        tsfile.Upload()
        thresholdFile = drive.ListFile({'q': "title contains 'threshold:' and trashed=false"}).GetList()
    thresholdFile = thresholdFile[0]['title']
    notifThreshold = int(re.sub("threshold:", "", thresholdFile))
    return notifThreshold

#instructions

#authorize gdrive
gauth = GoogleAuth()
gauth.LocalWebserverAuth() # Creates local webserver and auto handles authentication.
drive = GoogleDrive(gauth)
#query real time API
results = mainGA("29635119","UA-29635119-2")
#load threshold
threshold = getThreshold()
#check if we got any results
if set(["rows"]).issubset(results):
    results = results["rows"]
    resultString = str()
    # go through each active URL and check whether it has enough users to trigger an alert
    for subList in results:
        if (int(subList[1])) >= threshold:
            #if it does, add it to the output
            resultString = resultString + "\n url: " + subList[0] + " visitors: " + subList[1]
    # check whether there is any output, and how much time elapsed from the last email (not to send too many)
    if len(resultString) > 0 and updateTimestamp() == True:
        sendAlert(resultString,threshold)

