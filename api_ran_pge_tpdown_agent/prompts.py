from llama_index.prompts import PromptTemplate


instruction_str = """\
    1. Analyse and Understand the question.
    2. Search the response by analyzing the description of each tool.
    3. The result should represent a solution to the query.
    4. YOU HAVE TO RETURN MORE THAN 1 TOOLS WHERE POSSIBLE.
    5. IF YOU HAVE NOT GOTTEN SUFFICIENT INFORMATION SAY YOU HAVE NOT FOUND THE RESULT.
    6. Do not quote the expression."""

# new_prompt = PromptTemplate(
#     """\
#     You are working with a pandas dataframe in Python.
#     The name of the dataframe is `df`.
#     This is the result of `print(df.head())`:
#     {df_str}

#     Follow these instructions:
#     {instruction_str}
#     Query: {query_str}

#     Expression: """
# )

new_prompt = PromptTemplate(
    """\
    You are working with a book in pdf containing courses about marketing, splitted into different chapter:
    

    Follow these instructions:
    {instruction_str}
    Query: {query_str}

    Expression: """
)

# context = """Purpose: The primary role of this agent is to assist users by providing accurate 
#             information about world population statistics and details about a country. """

context = """
            1. Analyse and Understand the question.
            2. Search the response by analyzing the description of each tool.
            3. The result should represent a solution to the query.
            4. YOU HAVE TO RETURN MORE THAN 1 TOOLS WHERE POSSIBLE.
            5. IF YOU HAVE NOT GOTTEN SUFFICIENT INFORMATION SAY YOU HAVE NOT FOUND THE RESULT.
            6. Do not quote the expression.
            Purpose: The primary role of this agent is to assist users by providing accurate 
            information and respond about marketing book. Different book chapter are provided and each contains specific topic.
             The response or answer can be found in more than one tool, in this case return all the sources. 
              Use bullet to format the response where necessary. """