from .vector_service import VectorStoreManager
from .chat_service import ChatManager
from .email_service import EmailService
from .database_service import MongoDBManager
from .textTospeech_service import SpeechGenerator
from .evalution_service import EvalutionManager
from .vector_service import VectorStoreManager
from .database_service import MongoDBManager
from .extractors_service import Extractor
from .transcript_service import TranscriptionService
from .unify_service import DataSaver
from .contentcheck_service import ContentChecker
from .download_service import VideoDownloader
from .chunks_service import TextChunker
from .activate_service import ActivateManager
from .home_service import ContentHandler
from .settings_service import SettingsManager
from .statistics_service import ContentManagement
from .traitement_pdf_service import PDF
from .traitement_lien_route import URL
from .traitement_video_service import Video
from .processor_service import TranscriptProcessor

# Instanciations des services
extractors_services = Extractor()
transcripts_service = TranscriptionService()
unifys_service = DataSaver()
contentCheck_services = ContentChecker()
download_services = VideoDownloader()
chunk_services = TextChunker()
activate_services = ActivateManager()
home_services = ContentHandler()
settings_services = SettingsManager()
satistics_services = ContentManagement()
pdf = PDF()
url = URL()
video = Video()
processor_services = TranscriptProcessor()
vector_services = VectorStoreManager()
chat_services = ChatManager()
email_services = EmailService()
database_services = MongoDBManager()
speech_services = SpeechGenerator()
evalution_services = EvalutionManager()