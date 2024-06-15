from openai import OpenAI
import base64

class SpeechGenerator:
    def __init__(self, model="tts-1"):
        self.client = OpenAI()
        self.model = model

    def generate_speech(self, text, voice="shimmer"):
        response = self.client.audio.speech.create(
            model=self.model,
            voice=voice,
            input=text
        )

        audio_base64 = base64.b64encode(response.content).decode('utf-8')
        return audio_base64

    def generate_speech_stream(self, text, voice="shimmer", segment_length=500):
        segments = [text[i:i+segment_length] for i in range(0, len(text), segment_length)]
        for segment in segments:
            response = self.client.audio.speech.create(
                model=self.model,
                voice=voice,
                input=segment
            )
            yield base64.b64encode(response.content).decode('utf-8')


