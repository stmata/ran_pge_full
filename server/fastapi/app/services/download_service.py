import os
import platform
from pytube import YouTube

class VideoDownloader:
    def __init__(self, download_path: str = None):
        if download_path is None:
            os_type = platform.system()
            if os_type == "Windows":
                self.download_path = os.path.join(os.path.expanduser('~'), 'Downloads')
            else:  
                self.download_path = os.path.join(os.path.expanduser('~'), 'Downloads')
        else:
            self.download_path = download_path

    async def download_video(self, video_link: str) -> dict:
        try:
            yt = YouTube(video_link)
            video = yt.streams.filter(progressive=True, file_extension='mp4').order_by('resolution').desc().first()
            if video:
                video.download(self.download_path)
                return {"message": f"Vidéo sauvegardée dans {self.download_path}"}
            else:
                return {"error": "Impossible de télécharger la vidéo"}

        except Exception as e:
            return {"error": f"Une erreur est survenue : {e}"}