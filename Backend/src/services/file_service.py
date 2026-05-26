
import base64 
import os 
import shutil 

import fitz 
from models .gpt_model import client 


def save_file (file ,filename )->str :
    uploads_dir =os .path .abspath ("uploads")
    os .makedirs (uploads_dir ,exist_ok =True )

    safe_filename =os .path .basename (filename )
    file_path =os .path .join (uploads_dir ,safe_filename )

    with open (file_path ,"wb")as destination :
        shutil .copyfileobj (file ,destination )

    return file_path 


def transcribe_voice (file_path :str )->str :
    with open (file_path ,"rb")as audio_file :
        transcription =client .audio .transcriptions .create (
        model ="whisper-1",
        file =audio_file 
        )

    return transcription .text 


def extract_pdf_text (file_path :str )->str :
    text =""

    with fitz .open (file_path )as document :
        for page in document :
            text +=page .get_text () # type: ignore

    return text 


def encode_image_base64 (file_path :str )->str :
    with open (file_path ,"rb")as image_file :
        return base64 .b64encode (image_file .read ()).decode ("utf-8")
