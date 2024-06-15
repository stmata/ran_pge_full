import re
import string
import nltk
from nltk.tokenize import sent_tokenize, word_tokenize
from nltk.corpus import stopwords
from nltk.stem import WordNetLemmatizer
from spellchecker import SpellChecker
 
class TranscriptProcessor:
    def _init_(self):
        nltk.download('punkt')
        nltk.download('stopwords')
        nltk.download('wordnet')
        self.spell_checker = SpellChecker()
        self.lemmatizer = WordNetLemmatizer()
        self.stopwords = set(stopwords.words('english'))
        self.punctuation_trans = str.maketrans('', '', string.punctuation)
 
    def pretraitement_transcription(self, transcription: str) -> str:
        transcription_sans_balises = re.sub(r'\[.*?\]', '', transcription)
        sentences = sent_tokenize(transcription_sans_balises)
 
        processed_text = []
        for sentence in sentences:
            mots = word_tokenize(sentence)
            mots_traites = []
            for mot in mots:
                mot_lower = mot.lower()
                if mot_lower not in self.stopwords:
                    mot_sans_ponctuation = mot_lower.translate(self.punctuation_trans)
                    if mot_sans_ponctuation:
                        mot_lemmatise = self.lemmatizer.lemmatize(mot_sans_ponctuation)
                        corrected_word = self.spell_checker.correction(mot_lemmatise)
                        if corrected_word: 
                            mots_traites.append(corrected_word)
 
            corrected_sentence = ' '.join(mots_traites)
            processed_text.append(corrected_sentence)
 
        return ' '.join(processed_text)