import speech_recognition as sr
from youtube_transcript_api import YouTubeTranscriptApi, NoTranscriptFound
from youtube_transcript_api.formatters import TextFormatter

class TranscriptionService:
    def __init__(self):
        self.recognizer = sr.Recognizer()

    def transcribe_recognize_whisper(self, audio_path):
        """
        Recognize speech from an audio file using Whisper.

        :param audio_path: Path to the audio file.
        :return: Transcribed text or error message.
        """
        with sr.AudioFile(audio_path) as source:
            audio_data = self.recognizer.record(source)
        try:
            text = self.recognizer.recognize_whisper(audio_data, 'base')
            return text
        except sr.UnknownValueError:
            return "Speech recognition could not understand the audio."
        except sr.RequestError as e:
            return f"Error making a request to the speech recognition service: {e}"

    def get_youtube_transcript(self, video_id):
        """
        Fetch and format transcript for a given YouTube video ID.

        :param video_id: YouTube video ID.
        :return: Formatted transcript or error message.
        """
        try:
            transcript_list = YouTubeTranscriptApi.list_transcripts(video_id)
            transcript = None
            try:
                 # Try to find an English transcript
                transcript = transcript_list.find_transcript(['en'])
            except NoTranscriptFound:
                 # If no English transcript is found, try to find a French transcript
                transcript = transcript_list.find_transcript(['fr'])
            formatter = TextFormatter()
            text_formatted = formatter.format_transcript(transcript.fetch())
            text_formatted = text_formatted.replace('\n', ' ')
            return text_formatted
        except NoTranscriptFound:
            # Return None or '' if no transcript is found
            return None
        except Exception as e:
            return f"Error: {e}"
