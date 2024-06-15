import os
import json
from fastapi import HTTPException
import openai
from langchain_openai import ChatOpenAI,AzureChatOpenAI
from langchain.chains import ConversationalRetrievalChain
import ast
from langchain.memory import ConversationBufferMemory
import random
import pandas as pd
import numpy as np
from .database_service import MongoDBManager



class EvalutionManager:
    """
    Evaluation Manager class handles the generation of quiz questions, study plans, comparison of answers,
    and other evaluation-related functionalities.

    Attributes:
        current_llm: The current language model used for generating responses and processing requests.

    Methods:
        __init__: Initializes the EvaluationManager class.
        load_env: Loads environment variables from a .env file.
        get_quiz_data: Retrieves quiz data based on a specified vector store and level of difficulty.
        makePlanForStudent: Generates a detailed study plan for a student based on their incorrect answers.
        get_full_file_path: Builds the full path to a file within a specific subfolder and checks its existence.
        get_full_subfolder_path: Builds the full path to a specific subfolder and verifies its existence.
        quizz_qcm_offline: Converts a file containing 'Question', 'Choice', and 'A', 'B', 'C', 'D' options into a list of quiz questions and answers.
        quizz_ouverte_offline: Converts a file containing 'Question' and 'Reponse' columns into a list of open-ended quiz questions and answers.
        quizz_qcm_offline_general: Collects quiz questions and answers from multiple files in the 'QCM' subfolder and returns a combined list.
        quizz_ouverte_offline_general: Collects open-ended quiz questions and answers from multiple files in the 'Ouverte' subfolder and returns a combined list.
        extract_questions_and_references: Extracts questions and references from a DataFrame file.
        compare_answers_with_gpt3: Compares user answers with correct answers using GPT-3 for evaluation.
        compare_multiple_answers: Compares multiple sets of user answers with correct answers using GPT-3.
    """
    def __init__(self):
        """
        Initializes the EvaluationManager class with the default language model.
        """
        self.load_env()
        self.db_manager = MongoDBManager()
        self.dataframStatus_collection = self.db_manager.get_collection('dataframStatus')
        
        # self.current_llm = AzureChatOpenAI(api_key=os.getenv('AZURE_OPENAI_KEY'), azure_endpoint=os.getenv('AZURE_OPENAI_ENDPOINT') , azure_deployment='sk-4',openai_api_version="2023-05-15")

        self.current_llm = ChatOpenAI(temperature=0.9)


    def load_env(self):
        from dotenv import load_dotenv
        load_dotenv()

    async def get_quiz_data(self, vector_store,level):
        """
        Retrieves quiz data based on a specified vector store and level of difficulty.

        Args:
            vector_store: The vector store used for retrieval.
            level: The difficulty level of the quiz questions.

        Returns:
            Quiz data in the specified format.
        """
        # tools = [
        #     Tool(
        #         name="Quiz",
        #         func=vector_store.run,
        #         description="generate questions related to the loaded dataset",
        #     ),
        # ]
        # agent = initialize_agent(
        #     tools, self.llm, agent=AgentType.ZERO_SHOT_REACT_DESCRIPTION, verbose=True {level}
        # )
        ENGLISH_PROMPT = f"""
        YOU ARE AN ASSISTANT PROGRAMMED to generate questions related to the content loaded. For each content provided, your task is to design 5 distinct questions. Each of these questions will be accompanied by 4 possible answers: one correct answer and three incorrect ones.

        For clarity and ease of processing, structure your response to emulate a Python list of lists.

        Your output should be shaped as follows:

        1. An outer list that contains exactly 5 inner lists.
        2. Each inner list represents a set of question and answers, and contains exactly 5 strings in this order:
        - The generated question.
        - The correct answer.
        - The first incorrect answer.
        - The second incorrect answer.
        - The third incorrect answer.

        Your output should mirror this structure:
        [
            ["Generated Question 1", "Correct Answer 1", "Incorrect Answer 1.1", "Incorrect Answer 1.2", "Incorrect Answer 1.3"],
            ["Generated Question 2", "Correct Answer 2", "Incorrect Answer 2.1", "Incorrect Answer 2.2", "Incorrect Answer 2.3"],
            ...
        ]

        It's crucial that you adhere to this format as it's optimized for further Python processing. Ensure there are exactly 5 questions, all in English, no more, no less.

        """

        FRENCH_PROMPT = f"""
        Vous êtes un assistant programmé pour générer des questions d'évaluation pour des étudiants en utilisant des informations provenant d'une base de connaissances diverse. Les questions doivent évaluer la compréhension des concepts de manière générale, sans présumer que l'étudiant a accès ou connaissance de textes ou auteurs spécifiques mentionnés dans la base de données. De plus, veillez à ne pas inclure de références telles que "selon le texte", "selon l'auteur" ou "selon les cas" dans les questions.

        Votre tâche consiste à créer des questions qui testent la compréhension des concepts clés en lien avec les sujets abordés, sans faire référence à des exemples, des cas ou théories spécifiques mentionnés dans les documents. Les questions devraient pouvoir être répondus par des étudiants ayant une compréhension théorique du sujet mais qui n'ont pas nécessairement lu le matériel spécifique de la base de données.

        Structurez chaque question pour qu'elle évalue des principes ou des applications générales des concepts étudiés, et incluez trois réponses possibles : une correcte et deux incorrectes pour chaque question.

        Pour plus de clarté et de facilité de traitement, structurez votre réponse pour imiter une liste de listes en Python.

        Votre sortie doit être structurée comme suit :

        1. Une liste externe qui contient exactement 5 listes internes.

        2. Chaque liste interne représente un ensemble de question et réponses, et contient exactement 5 chaînes dans cet ordre :
        - La question générée.
        - La réponse correcte.
        - La première réponse incorrecte.
        - La deuxième réponse incorrecte.
        - La troisième réponse incorrecte.

        Votre sortie doit refléter cette structure :
        [
            ["Question Générée 1", "Réponse Correcte 1", "Réponse Incorrecte 1.1", "Réponse Incorrecte 1.2", "Réponse Incorrecte 1.3"],
            ["Question Générée 2", "Réponse Correcte 2", "Réponse Incorrecte 2.1", "Réponse Incorrecte 2.2", "Réponse Incorrecte 2.3"],
            ...
        ]

        Il est crucial que vous respectiez ce format car il est optimisé pour le traitement ultérieur en Python. IL EST TOUT AUSSI PRIMORDIAL D'AVOIR EXACTEMENT 5 QUESTIONS TOUS EN FRANÇAIS, PAS PLUS NI MOINS.
        """


    #     template= """
    #     **YOU ARE AN ASSISTANT PROGRAMMED. Each time you receive a task, it's as if you're starting fresh, with no memory of past interactions. Your primary function is to follow instructions given in the moment, regardless of the dataset's language. Your outputs and communications are in English.**

    #     When presented with a chunk of dataset, even if in French, your task is to create 20 questions in English related to the content. These questions should come with three possible answers each: one correct answer and two incorrect ones. Structure your response as follows for clarity and ease of processing:

    #     1-Create an outer list containing 20 inner lists.

    #     2-Each inner list will represent a question-and-answer set, containing exactly four strings in this order:
    #         -The question (in English).
    #         -The correct answer (in English).
    #         -The first incorrect answer (in English).
    #         -The second incorrect answer (in English).
        
    #     3-Your response should adhere to this example structure:

    #     [
    #         ["Generated Question 1", "Correct Answer 1", "Incorrect Answer 1.1", "Incorrect Answer 1.2"],
    #         ["Generated Question 2", "Correct Answer 2", "Incorrect Answer 2.1", "Incorrect Answer 2.2"],
    #         ...
    #     ]
    #     This format is optimized for further Python processing. Additionally, ensure any non-English content is translated into English when generating questions and answers to ensure consistency and understanding.
    #    """

        


        # agent.run(template)
        try:
            current_memory = ConversationBufferMemory(memory_key='chat_history', return_messages=False)
            print(current_memory)
            conversation_chain = ConversationalRetrievalChain.from_llm(
                llm=self.current_llm,
                retriever=vector_store.as_retriever(),
                memory=current_memory
            )
            result = ""
            if level == "M1":
                result = conversation_chain({'question': ENGLISH_PROMPT})
            elif level == "L3":
                result = conversation_chain({'question': FRENCH_PROMPT})
 
            #result = conversation_chain({'question': template})
            
            await current_memory.aclear()
            print(current_memory)
            print(result['answer'])


            return result['answer']
        

        except Exception as e:
            if "AuthenticationError" in str(e):
                print("Incorrect API key provided. Please check and update your API key.")
            else:
                print(f"An error occurred: {str(e)}")

    def get_full_folder_path(self, level, course, evaluation_type):
        """
        This function returns the full path of a folder based on the given level, course, and evaluation type.
        Args:

            self: The instance of the class.
            level (str): The level of the course.
            course (str): The name of the course.
            evaluation_type (str): The type of evaluation. It can be either 'qcm' or 'ouverte'.

        Returns:
            str: The full path of the folder.
        Raises:
            HTTPException: If the evaluation type is invalid.
        The function first sets the base path to "../../datafram_offline". Then, it checks the evaluation type and joins the corresponding folder name to the base path using os.path.join(). If the evaluation type is not 'qcm' or 'ouverte', it raises an HTTPException with a status code of 400 and a detail message of "Invalid evaluation type". Finally, it returns the full path of the folder.
        """
        base_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', 'datafram_offline'))
        if evaluation_type.lower() == 'qcm':
            folder_path = os.path.join(base_path,course, level, "QCM")
            print(folder_path)
        elif evaluation_type.lower() == 'ouverte':
            folder_path = os.path.join(base_path,course, level, "Ouverte")
        else:
            raise HTTPException(status_code=400, detail="Invalid evaluation type")
        return folder_path

    def check_files_exist(self, folder_path):
        """
        This function checks if the files exist in a given folder path.

        Args:
        - self: The instance of the class.
        - folder\_path (str): The path of the folder to check.

        Returns:
        - bool: True if the folder exists and contains at least one file, False otherwise.

        The function first checks if the folder exists using os.path.exists(). If the folder does not exist, it returns False. Otherwise, it uses os.listdir() to get a list of all files and directories in the folder. If the list is empty, it means that the folder does not contain any files, so the function returns False. Otherwise, it returns True.
        """
        
        return os.path.exists(folder_path) and os.listdir(folder_path)

    def add_or_update_status(self, course, level, evaluation_type, status):
        """
        This function adds or updates the status of a course level and evaluation type in the dataframStatus collection.

        Args:
        - course (str): The course name.
        - level (str): The course level.
        - evaluation_type (str): The evaluation type.
        - status (bool): The status to set.

        Returns:
        - bool: True if the operation was successful, False otherwise.

        Raises:
        - HTTPException: If the folder for the course, level, and evaluation type is not found.
        """
        try:
            # Check if the folder exists
            folder_path = self.get_full_folder_path(level, course, evaluation_type)
            if not self.check_files_exist(folder_path):
                raise HTTPException(status_code=404, detail=f"Folder for {course}, {level}, {evaluation_type} not found")

            # Query to find if document already exists
            query = {"course": course}
            document = self.dataframStatus_collection.find_one(query)

            # Prepare the update dictionary based on the evaluation type
            update_data = {
                f"{level}.{evaluation_type.lower()}_enabled": status
            }

            if document:
                # Update existing document
                self.dataframStatus_collection.update_one(query, {"$set": update_data})
            else:
                # Insert new document
                insert_data = {
                    "course": course,
                    f"{level}": {
                        evaluation_type.lower() + "_enabled": status
                    }
                }
                self.dataframStatus_collection.insert_one(insert_data)
            return True
        except Exception as e:
            print(f"An error occurred while adding or updating status: {e}")
            return False


    async def get_status(self, course, level, evaluation_type):
        """
        Retrieves the status of a specific course level and evaluation type from the dataframStatus collection.

        Args:
        - course (str): The course name.
        - level (str): The course level.
        - evaluation_type (str): The evaluation type.

        Returns:
        - bool: True if the status was retrieved successfully, False otherwise.
        """
        try:
            query = {"course": course}
            document = self.dataframStatus_collection.find_one(query)
            if document:
                status = document.get(level, {}).get(evaluation_type.lower() + "_enabled", False)
                return status
            return False
        except Exception as e:
            print(f"Error in get_status: {e}")
            return False



    @staticmethod
    def string_to_list(s):
        try:
            return ast.literal_eval(s)
        except (SyntaxError, ValueError) as e:
            print(f"Error: The provided input is not correctly formatted. {e}")
    
     # new method added vy Cheikh
    async def get_quiz_data_for_client_web(self, vector_store,level,nbrinnerList):
        """
        Retrieves quiz data based on a specified vector store and level of difficulty.

        Args:
            vector_store: The vector store used for retrieval.
            level: The difficulty level of the quiz questions.
            nbrinnerList: The length of the inner list

        Returns:
            Quiz data in the specified format.
        """

        ENGLISH_PROMPT = f"""
        YOU ARE AN ASSISTANT PROGRAMMED to generate questions related to the content loaded. For each content provided, your task is to design {nbrinnerList} distinct questions. Each of these questions will be accompanied by 4 possible answers: one correct answer and three incorrect ones.

        For clarity and ease of processing, structure your response to emulate a Python list of lists.

        Your output should be shaped as follows:

        1. An outer list that contains exactly {nbrinnerList} inner lists.
        2. Each inner list represents a set of question and answers, and contains exactly 5 strings in this order:
        - The generated question.
        - The correct answer.
        - The first incorrect answer.
        - The second incorrect answer.
        - The third incorrect answer.

        Your output should mirror this structure:
        [
            ["Generated Question 1", "Correct Answer 1", "Incorrect Answer 1.1", "Incorrect Answer 1.2", "Incorrect Answer 1.3"],
            ["Generated Question 2", "Correct Answer 2", "Incorrect Answer 2.1", "Incorrect Answer 2.2", "Incorrect Answer 2.3"],
            ...
        ]

        It's crucial that you adhere to this format as it's optimized for further Python processing. Ensure there are exactly {nbrinnerList} questions, all in English, no more, no less.

        """

        FRENCH_PROMPT = f"""
        Vous êtes un assistant programmé pour générer des questions d'évaluation pour des étudiants en utilisant des informations provenant d'une base de connaissances diverse. Les questions doivent évaluer la compréhension des concepts de manière générale, sans présumer que l'étudiant a accès ou connaissance de textes ou auteurs spécifiques mentionnés dans la base de données. De plus, veillez à ne pas inclure de références telles que "selon le texte", "selon l'auteur" ou "selon les cas" dans les questions.

        Votre tâche consiste à créer des questions qui testent la compréhension des concepts clés en lien avec les sujets abordés, sans faire référence à des exemples, des cas ou théories spécifiques mentionnés dans les documents. Les questions devraient pouvoir être répondus par des étudiants ayant une compréhension théorique du sujet mais qui n'ont pas nécessairement lu le matériel spécifique de la base de données.

        Structurez chaque question pour qu'elle évalue des principes ou des applications générales des concepts étudiés, et incluez trois réponses possibles : une correcte et deux incorrectes pour chaque question.

        Pour plus de clarté et de facilité de traitement, structurez votre réponse pour imiter une liste de listes en Python.

        Votre sortie doit être structurée comme suit :

        1. Une liste externe qui contient exactement {nbrinnerList} listes internes.

        2. Chaque liste interne représente un ensemble de question et réponses, et contient exactement 5 chaînes dans cet ordre :
        - La question générée.
        - La réponse correcte.
        - La première réponse incorrecte.
        - La deuxième réponse incorrecte.
        - La troisième réponse incorrecte.

        Votre sortie doit refléter cette structure :
        [
            ["Question Générée 1", "Réponse Correcte 1", "Réponse Incorrecte 1.1", "Réponse Incorrecte 1.2", "Réponse Incorrecte 1.3"],
            ["Question Générée 2", "Réponse Correcte 2", "Réponse Incorrecte 2.1", "Réponse Incorrecte 2.2", "Réponse Incorrecte 2.3"],
            ...
        ]

        Il est crucial que vous respectiez ce format car il est optimisé pour le traitement ultérieur en Python. IL EST TOUT AUSSI PRIMORDIAL D'AVOIR EXACTEMENT {nbrinnerList} QUESTIONS TOUS EN FRANÇAIS, PAS PLUS NI MOINS.
        """

        try:
            current_memory = ConversationBufferMemory(memory_key='chat_history', return_messages=False)
            print(current_memory)
            conversation_chain = ConversationalRetrievalChain.from_llm(
                llm=self.current_llm,
                retriever=vector_store.as_retriever(),
                memory=current_memory
            )
            result = ""
            if level == "M1":
                result = conversation_chain({'question': ENGLISH_PROMPT})
            elif level == "L3":
                result = conversation_chain({'question': FRENCH_PROMPT})
 
            
            await current_memory.aclear()
            print(current_memory)
            print(result['answer'])


            return result['answer']
        

        except Exception as e:
            if "AuthenticationError" in str(e):
                print("Incorrect API key provided. Please check and update your API key.")
            else:
                print(f"An error occurred: {str(e)}")

   
    async def makePlanForStudent(self, vector_store,level, arrayWrongAnswer):
        """
        Generates a detailed study plan for a student based on their incorrect answers.

        Args:
            vector_store: The vector store used for retrieval.
            arrayWrongAnswer: An array of incorrect answers made by the student.

        Returns:
            A detailed study plan to help the student improve.
        """ 

        questions_str = "\n".join([f"- {question}" for question in arrayWrongAnswer])
        PLAN_PROMPT_FR = f"""
            En tant que professeur, vous avez récemment évalué un étudiant qui a eu des difficultés avec certaines questions spécifiques dans votre cours. Votre tâche est de créer un plan d'étude détaillé pour aider cet étudiant à apprendre et à s'améliorer dans les domaines couverts par ces questions. Chaque section doit contenir une brève description de ce qui sera abordé.

            Si des informations spécifiques sur une question ne sont pas disponibles, basez votre réponse sur des principes éducatifs pertinents et des connaissances générales du sujet, tout en restant aussi proche que possible du contexte des questions posées. Assurez-vous que chaque réponse soit utile, précise et encourageante pour l'étudiant.

            Veuillez fournir un plan d'étude pour aider l'étudiant à apprendre et à s'améliorer dans les domaines spécifiques des questions posées qui sont les suivantes :
            {questions_str}

            IL EST IMPÉRATIF QUE CE SOIT EN FRANÇAIS.
        """

        PLAN_PROMPT_EN = f"""
        As a teacher, you've recently evaluated a student who struggled with particular questions in your course. Your task is to craft a detailed study plan to aid this student's learning and improvement in the areas covered by these questions. Each section should include a brief overview of what will be addressed.

        If specific information about a question isn't available, base your response on relevant educational principles and general subject knowledge, while remaining as close as possible to the context of the questions asked. Ensure each response is helpful, accurate, and encouraging for the student.

        Please provide a study plan to help the student learn and improve in the specific areas of the questions posed, which are as follows:
        {questions_str}

        It is imperative that the plan is in English
        """


        PLAN_PROMPT = ""
        if level == "M1":
            PLAN_PROMPT = PLAN_PROMPT_EN
        elif level == "L3":
            PLAN_PROMPT = PLAN_PROMPT_FR
        
        try:
            current_memory = ConversationBufferMemory(memory_key='chat_history', return_messages=False)
            print(current_memory)
            conversation_chain = ConversationalRetrievalChain.from_llm(
                llm=self.current_llm,
                retriever=vector_store.as_retriever(),
                memory=current_memory
            )

            result = conversation_chain({'question': PLAN_PROMPT})

            await current_memory.aclear()
            print(current_memory)

            return result['answer']

        except Exception as e:
            if "AuthenticationError" in str(e):
                print("Incorrect API key provided. Please check and update your API key.")
            else:
                print(f"An error occurred: {str(e)}")



    @staticmethod
    def get_full_file_path(course_name, level, subfolder_name, file_name):
        """
        Builds the full path to a file within a specific course and level subfolder, and checks its existence.

        Args:
            root_folder_name: Name of the root folder containing the subfolders.
            course_name: Name of the course.
            level: Level of the course.
            subfolder_name: Name of the subfolder containing the file.
            file_name: Name of the file.

        Returns:
            Full path to the file.
        """
        modified_file_name = file_name.replace(':', '').strip() + '.pkl'
        root_folder_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', 'datafram_offline'))
        course_path = os.path.join(root_folder_path, course_name)
        level_path = os.path.join(course_path, level)
        subfolder_path = os.path.join(level_path, subfolder_name)
        full_file_path = os.path.abspath(os.path.join(subfolder_path, modified_file_name))
        
        if not os.path.exists(full_file_path):
            raise FileNotFoundError(f"Le fichier {full_file_path} n'existe pas.")
        

        return full_file_path
    
    @staticmethod
    def get_full_subfolder_path(course_name, level, subfolder_name):
        try:
            root_folder_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', 'datafram_offline'))
            course_path = os.path.join(root_folder_path, course_name)
            level_path = os.path.join(course_path, level)
            full_subfolder_path = os.path.abspath(os.path.join(level_path, subfolder_name))
            
            if not os.path.exists(full_subfolder_path):
                raise FileNotFoundError(f"Le sous-dossier {subfolder_name} n'existe pas dans {level_path}.")

            return full_subfolder_path

        except Exception as e:
            print(f"Une erreur est survenue lors de la construction du chemin du sous-dossier : {str(e)}")
            return None




    @staticmethod
    def quizz_qcm_offline(course_name, level,file_name):
        """
        Converts a file containing 'Question', 'Choice', and 'A', 'B', 'C', 'D' options into a list of quiz questions and answers.

        Args:
            course_name: Name of the course (e.g., 'Marketing').
            level: The level of the course (e.g., 'L3', 'M1').
            file_name: Name of the file containing quiz questions and answers (without file extension).

        Returns:
            List of quiz questions and answers.
            If an error occurs (e.g., file not found), returns None.
        """

        file_path = ""
        try:
            file_path = EvalutionManager.get_full_file_path(course_name, level, 'QCM', file_name)
            df = pd.read_pickle(file_path)

            questions_and_answers = []

            for index, row in df.iterrows():
                question = row["Question"]
                correct_answer = row["Choice"]
                incorrect_answers = [row["A"], row["B"], row["C"]]
                if not pd.isnull(row["D"]): 
                    incorrect_answers.append(row["D"])

                correct_index = ord(correct_answer) - ord('A') 
                correct_answer = incorrect_answers.pop(correct_index)

                questions_and_answers.append([question, correct_answer] + incorrect_answers)

            random_selection = random.sample(questions_and_answers, 5)

            return random_selection

        except FileNotFoundError as e:
            print(f"Le fichier {file_path} n'a pas été trouvé.")
            return None
        except Exception as e:
            print(f"Une erreur est survenue lors de la lecture du fichier {file_name}: {str(e)}")
            return None
    
    @staticmethod
    def quizz_ouverte_offline(course_name, level,file_name):
        """
        Converts a file containing 'Question' and 'Reponse' columns into a list of open-ended quiz questions and answers.

        Args:
            course_name: Name of the course (e.g., 'Marketing').
            level: The level of the course (e.g., 'L3', 'M1').
            file_name: Name of the file containing quiz questions and answers (without file extension).

        Returns:
            List of open-ended quiz questions and answers.
            If an error occurs (e.g., file not found), returns None.
        """

        file_path = ""
        try:
            file_path = EvalutionManager.get_full_file_path(course_name, level,"Ouverte", file_name)
            
            df = pd.read_pickle(file_path)

            questions_and_answers = []

            for index, row in df.iterrows():
                question = row["Question"]
                response = row["Reponse"]

                if pd.isnull(response):
                    response = np.nan

                questions_and_answers.append([question, response])

            random_selection = random.sample(questions_and_answers, 5)

            return random_selection

        except FileNotFoundError as e:
            print(f"Le fichier {file_path} n'a pas été trouvé.")
            return None
        
        except Exception as e:
            print(f"Une erreur est survenue lors de la manipulation du fichier '{file_name}': {str(e)}")
            return None

    @staticmethod
    def quizz_qcm_offline_general(course_name, level):
        """
        Collects quiz questions and answers from multiple files in the 'QCM' subfolder and returns a combined list.

        Returns:
            Combined list of quiz questions and answers.
        """

        all_questions = []

        try:
            qcm_directory = EvalutionManager.get_full_subfolder_path(course_name, level,"QCM")

            for file_name in os.listdir(qcm_directory):
                if file_name.endswith('.pkl'):
                    file_path = os.path.join(qcm_directory, file_name)

                    df = pd.read_pickle(file_path)

                    questions_and_answers = []
                    for index, row in df.iterrows():
                        question = row["Question"]
                        correct_answer = row["Choice"]
                        incorrect_answers = [row["A"], row["B"], row["C"]]
                        if not pd.isnull(row["D"]): 
                            incorrect_answers.append(row["D"])

                        correct_index = ord(correct_answer) - ord('A')
                        correct_answer = incorrect_answers.pop(correct_index)

                        questions_and_answers.append([question, correct_answer] + incorrect_answers)

                    random_selection = random.sample(questions_and_answers, 4)

                    all_questions.extend(random_selection)

            return all_questions

        except Exception as e:
            print(f"Une erreur est survenue lors de la lecture des fichiers dans le répertoire QCM: {str(e)}")
            return None

    
    @staticmethod
    def quizz_ouverte_offline_general(course_name, level):
        """
        Collects open-ended quiz questions and answers from multiple files in the 'Ouverte' subfolder and returns a combined list.

        Returns:
            Combined list of open-ended quiz questions and answers.
        """
        all_questions = []

        try:
            ouverte_directory = EvalutionManager.get_full_subfolder_path(course_name, level,"Ouverte")

            for file_name in os.listdir(ouverte_directory):
                if file_name.endswith('.pkl'): 
                    file_path = os.path.join(ouverte_directory, file_name)
                    
                    df = pd.read_pickle(file_path)
                    questions_and_answers = []

                    for index, row in df.iterrows():
                        question = row["Question"]
                        response = row["Reponse"]

                        # Si la réponse est vide, remplacer par NaN
                        if pd.isnull(response):
                            response = "Pas encore de Réponse"

                        questions_and_answers.append([question, response])

                    random_selection = random.sample(questions_and_answers, 4)

                    all_questions.extend(random_selection)

            return all_questions

        except Exception as e:
            print(f"Une erreur est survenue lors de la manipulation des fichiers: {str(e)}")
            return None
    
    @staticmethod
    def extract_questions_and_references(course_name, level, folder,file_name=None):
        """
        Extracts questions and references from a DataFrame file.

        Args:
            folder: Name of the subfolder containing the DataFrame file.
            file_name: Name of the DataFrame file. If None, extracts from all files in the folder.

        Returns:
            List of tuples containing questions and references.
        """
        file_path = ""
        try:
            if file_name is not None:
                file_path = EvalutionManager.get_full_file_path(course_name, level,folder, file_name)
                df = pd.read_pickle(file_path)
                questions_and_references = []

                for index, row in df.iterrows():
                    question = row["Question"]
                    reference = row["Reference"]
                    questions_and_references.append((question, reference))

                return questions_and_references
            else:
                all_reference = []
                folder_path = EvalutionManager.get_full_subfolder_path(course_name, level,folder)
                for file_name in os.listdir(folder_path):
                    if file_name.endswith('.pkl'): 
                        file_path = os.path.join(folder_path, file_name)
                        df = pd.read_pickle(file_path)
                        questions_and_answers = []

                        for index, row in df.iterrows():
                            question = row["Question"]
                            reference = row["Reference"]
                            questions_and_answers.append((question, reference))

                        all_reference.extend(questions_and_answers)

                return all_reference

        except FileNotFoundError as e:
            print(f"Le fichier {file_path} n'a pas été trouvé.")
            return None
            
        except Exception as e:
            print(f"Une erreur est survenue lors de la manipulation du fichier '{file_name}': {str(e)}")
            return None
    
    @staticmethod
    def compare_answers_with_gpt3(question, user_answer, correct_answer):
        """
        Compares user answers with correct answers using GPT-3 for evaluation.

        Args:
            question: The question presented to the user.
            user_answer: The answer provided by the user.
            correct_answer: The correct answer to the question.

        Returns:
            Boolean value indicating whether the user's answer is correct or not.
        """
        try:

            prompt = f"Vous êtes un correcteur d'examen expérimenté dans une école de business. Voici une question d'examen : '{question}'. La réponse jugée correcte est '{correct_answer}'. Cependant, l'étudiant a répondu '{user_answer}'. Évaluez la réponse de l'étudiant et repondez par Oui ou Non. Prenez en compte aussi que si les éléments fournis par l'étudiant forme au minimum un sous ensemble considérable d'éléments demandés alors la réponse reste correcte"

            # Créer la complétion
            openai.api_type = 'openai'
            response = openai.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[{"role": "system", "content": prompt}],
            temperature=0.7
            )

            generated_answer = response.choices[0].message.content.lower()
            print(generated_answer)
            if "oui" in generated_answer:
                return True
            else:
                return False

        except Exception as e:
            print(f"Erreur lors de la comparaison avec GPT-3 : {str(e)}")
            return False
    
    @staticmethod
    def compare_multiple_answers(responses_list):
        """
        Compares multiple sets of user answers with correct answers using GPT-3.

        Args:
            responses_list: List of dictionaries containing question, user_answer, and correct_answer.

        Returns:
            List of boolean values indicating correctness of each user answer.
        """
        results = []
        for response in responses_list:
            question = response.get('question')
            user_answer = response.get('user_answer')
            correct_answer = response.get('correct_answer')
            is_correct = EvalutionManager.compare_answers_with_gpt3(question, user_answer, correct_answer)
            print(is_correct)
            results.append(is_correct)
        return results



# import os
# from dotenv import load_dotenv
# from langchain_community.chat_models import ChatOpenAI
# from langchain.llms import OpenAI
# from langchain.agents import initialize_agent, AgentType
# from langchain.tools import Tool
# import ast
# from langchain.chains import RetrievalQA, LLMChain, ChatVectorDBChain

# class EvalutionManager:
#     def __init__(self):
#         self.load_env()
#         # Initialize ChatOpenAI with GPT-4 (assuming your API key is set in .env file)
#         self.current_llm = ChatOpenAI(model='gpt-4')
#         # Initialize OpenAI with a specified temperature
#         self.llm = OpenAI(temperature=0)

#     def load_env(self):
#         load_dotenv()

#     def get_quiz_data(self, vector_store):
#         try:
#             # Initialize RetrievalQA with vector_store as retriever
#             state_of_union = RetrievalQA.from_chain_type(
#                 llm=self.current_llm, chain_type="stuff", retriever=vector_store.as_retriever()
#             )

#             # Define the template for question generation
#             template = ("You are a helpful assistant programmed to generate questions related to the loaded dataset. "
#                         "For every chunk of text you receive, you're tasked with designing 10 distinct questions. "
#                         "Each of these questions will be accompanied by 3 possible answers: one correct answer and two incorrect ones. "
#                         "For clarity and ease of processing, structure your response in a way that emulates a Python list of lists. "
#                         "Your output should be shaped as follows: "
#                         "1. An outer list that contains 20 inner lists. "
#                         "2. Each inner list represents a set of question and answers, and contains exactly 4 strings in this order: "
#                         "- The generated question. "
#                         "- The correct answer. "
#                         "- The first incorrect answer. "
#                         "- The second incorrect answer. "
#                         "It is crucial that you adhere to this format as it's optimized for further Python processing.")

#             # Define the tool for generating questions
#             tools = [
#                 Tool(
#                     name="Quiz 1",
#                     func=state_of_union.run,  # Use state_of_union.run to generate questions
#                     description='"Generated Different Question 1", "Correct Answer 1", "Incorrect Answer 1.1", "Incorrect Answer 1.2"',
#                 ),
#             ]

#             # Initialize the agent with the specified tools
#             agent = initialize_agent(
#                 tools=tools,
#                 llm=self.current_llm,
#                 agent_type=AgentType.ZERO_SHOT_REACT_DESCRIPTION,
#                 verbose=True
#             )

#             # Execute the agent with the template as input
#             result = agent.run(input=template)
#             print(result.output)  # Display the result
#         except Exception as e:
#             print(f"An error occurred: {str(e)}")
#             # Specific error handling or recovery actions can be added here

#     @staticmethod
#     def string_to_list(s):
#         if not s:  # Vérifie si la chaîne est None ou vide
#             print("La chaîne d'entrée est vide ou None.")
#             return []
#         try:
#             # Essayez de convertir la chaîne en liste
#             return ast.literal_eval(s)
#         except (SyntaxError, ValueError) as e:
#             print(f"Erreur lors de la conversion de la chaîne en liste : {e}")
#             return []  # Retourne une liste vide en cas d'erreur


# Note: This example assumes that 'vector_store.run' is a properly defined method for generating quiz questions.
# You might need to adjust this part according to how your vector_store and its method are implemented.
