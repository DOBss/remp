import pandas as pd
import os
from typing import List, Dict
from pydrive.auth import GoogleAuth
from pydrive.drive import GoogleDrive


RELEVANT_DATA_FOLDERS = ['pageviews', 'events', 'commerce']
MAIN_DATA_FOLDER = 'Influx'


def gdrive_authenticate() -> GoogleDrive:
    '''
    You need a client_secrets.json in order to run this
    :return:
    '''
    gauth = GoogleAuth()
    # Creates local webserver and auto handles authentication.
    gauth.LocalWebserverAuth()
    drive = GoogleDrive(gauth)

    return drive


def list_folder(drive: GoogleDrive, parent: str) -> List:
    '''
    taken from stackoverflow
    https://stackoverflow.com/questions/34101427/accessing-folders-subfolders-and-subfiles-using-pydrive-python
    and slightly changed as we're dealing with a finite set.
    :param drive:
    :param parent:
    :return:
    '''
    file_list = drive.ListFile({'q': "'%s' in parents and trashed=false" % parent}).GetList()
    for file in file_list:
        if 'mimeType' in file.keys():
            # if we're looking at a folder
            if file['mimeType'] == 'application/vnd.google-apps.folder':
                file_list.append({"id": file['id'], "title": file['title'], "list": list_folder(drive, file['id'])})
            else:
                file_list.append({"title": file['title']})

    return file_list


def get_folder_structure(drive: GoogleDrive):
    folder_strucrture = [file for file in list_folder(drive, 'root')
                         if file['title'] == MAIN_DATA_FOLDER]

    return folder_strucrture


def get_files_from_gfolder(file_list: List, target_folder: str) -> List:
    # We look for the appropriately named subfolder
    # print([x for x in file_list[1]['list'] if x['title'] == target_folder])
    data_folder = [x for x in file_list[1]['list'] if x['title'] == target_folder][1]['list']
    # The folder contents are a mixture of Google Drive File types and dicts, both contain the filenames and there's
    # one of each kind for each file, so it means we only need to take one of them (to avoid having duplicates)
    file_names = [{file['title']: file['id']} for file in data_folder if type(file) != dict]

    return file_names


def get_gdrive_csv_file_into_df(drive: GoogleDrive, file: Dict) -> pd.DataFrame:
    # print(list(file.keys())[0])
    # query = "title = '" + list(file.keys())[0] + "'"
    # print(query)
    # file_meta = drive.ListFile({'q': query}).GetList()
    # file_id = file_meta[0]['id']
    file_id = str(list(file.values())[0])
    gdrive_file = drive.CreateFile({'id': file_id})
    gdrive_file.GetContentFile('intermediate_data.gz')
    csv_data = pd.read_csv('intermediate_data.gz', low_memory=False)
    os.remove('intermediate_data.gz')

    return csv_data


def download_data(drive: GoogleDrive) -> Dict:
    '''
    Takes in an authenticated Gdrive token and downloads data from relevant data folders into a dictionary of
    dataframes, each dataframe representing a folder (pageviews, events or commerce)
    :param drive:
    :return:
    '''
    df_dict = {}
    folder_structure = get_folder_structure(drive)

    for data_folder in RELEVANT_DATA_FOLDERS:
        print(data_folder)
        df_dict[data_folder] = pd.DataFrame()
        folder_file_list = get_files_from_gfolder(folder_structure, data_folder)
        for index, file in enumerate(folder_file_list):
            if not index % int(round(len(folder_file_list) / 10, 0)) or index == len(folder_file_list) - 1:
                print(index / len(folder_file_list))
            file_df = get_gdrive_csv_file_into_df(drive, file)
            df_dict[data_folder] = df_dict[data_folder].append(file_df)

    return df_dict
