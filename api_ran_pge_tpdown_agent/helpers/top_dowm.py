from dotenv import load_dotenv
import os
import ast
import pandas as pd
from llama_index.query_engine import PandasQueryEngine
from prompts import new_prompt, instruction_str, context
from helpers.note_engine import note_engine_
from llama_index.tools import QueryEngineTool, ToolMetadata
from llama_index.agent import ReActAgent
from llama_index.llms import OpenAI
from helpers.pdf import (chap1_engine, chap2_engine, chap3_engine, chap4_engine, chap5_engine,
                 chap6_engine, chap7_engine, chap8_engine, chap9_engine, chap10_engine,
                 chap11_engine, chap12_engine, chap13_engine, chap14_engine, chap15_engine,
                 chap16_engine, chap17_engine, chap18_engine, chap19_engine, chap20_engine, chap21_engine,
                 chap22_engine, chap23_engine, chap24_engine, chap25_engine, chap26_engine, chap27_engine, chap28_engine,
                 chap29_engine, chap30_engine, chap31_engine, chap32_engine)

from descriptions import (chap1_desc, chap2_desc, chap3_desc, chap4_desc, chap5_desc, chap6_desc, chap7_desc,
                          chap8_desc, chap9_desc, chap10_desc, chap11_desc, chap12_desc, chap13_desc,chap14_desc,chap15_desc,
                          chap16_desc, chap17_desc, chap18_desc, chap19_desc, chap20_desc, chap21_desc,
                          chap22_desc, chap23_desc, chap24_desc, chap25_desc, chap26_desc, chap27_desc, chap28_desc, chap29_desc,
                          chap30_desc, chap31_desc, chap32_desc)

load_dotenv()

population_path = os.path.join("./data", "population.csv")
population_df = pd.read_csv(population_path)

population_query_engine = PandasQueryEngine(
    df=population_df, verbose=True, instruction_str=instruction_str
)
population_query_engine.update_prompts({"pandas_prompt": new_prompt})

tools = [
    note_engine_,
    QueryEngineTool(
        query_engine=population_query_engine,
        metadata=ToolMetadata(
            name="population_data",
            description="This gives information at the world population and demographics",
        ),
    ),
    # Chapter 1
    QueryEngineTool(
        query_engine=chap1_engine,
        metadata=ToolMetadata(
            name="Chapter_1_Defining_Marketing_for_the_New_Realities",
            description= chap1_desc,
            
        ),
        
    ),
    # Chapter 2 
    QueryEngineTool(
        query_engine=chap2_engine,
        metadata=ToolMetadata(
            name="Chapter_2_Marketing_Planning_and_Management",
            description= chap2_desc,
        ),
    ),
     # Chapter 3 
    QueryEngineTool(
        query_engine=chap3_engine,
        metadata=ToolMetadata(
            name="Chapter_3_Analyzing_Consumer_Markets",
            description= chap3_desc,
        ),
    ),
     # Chapter 4 
    QueryEngineTool(
        query_engine=chap4_engine,
        metadata=ToolMetadata(
            name="Chapter_4_Analyzing_Business_Markets",
            description= chap4_desc,
        ),
    ),
     # Chapter 5 
    QueryEngineTool(
        query_engine=chap5_engine,
        metadata=ToolMetadata(
            name="Chapter_5_Conducting_Marketing_Research",
            description=chap5_desc,
        ),
    ),
    # Chapter 6 
    QueryEngineTool(
        query_engine=chap6_engine,
        metadata=ToolMetadata(
            name="Chapter_6_Identifying_Market_Segments_and_Target_Customers",
            description=chap6_desc,
        ),
    ),
    # Chapter 7 
    QueryEngineTool(
        query_engine=chap7_engine,
        metadata=ToolMetadata(
            name="Chapter_7_Crafting_a_Customer_Value_Proposition_and_Positioning",
            description=chap7_desc,
        ),
    ),
    # Chapter 8 
    QueryEngineTool(
        query_engine=chap8_engine,
        metadata=ToolMetadata(
            name="Chapter_8_Designing_and_Managing_Products",
            description=chap8_desc,
        ),
    ),
    # Chapter 9 
    QueryEngineTool(
        query_engine=chap9_engine,
        metadata=ToolMetadata(
            name="Chapter_9_Designing_and_Managing_Services",
            description=chap9_desc,
        ),
    ),
    # Chapter 10 
    QueryEngineTool(
        query_engine=chap10_engine,
        metadata=ToolMetadata(
            name="Chapter_10_Building_Strong_Brands",
            description=chap10_desc,
                            
        ),
    ),
     # Chapter 11 
    QueryEngineTool(
        query_engine=chap11_engine,
        metadata=ToolMetadata(
            name="Chapter_11_Managing_Pricing_and_Sales_Promotions",
            description=chap11_desc,
                            
        ),
    ),
     # Chapter 12 
    QueryEngineTool(
        query_engine=chap12_engine,
        metadata=ToolMetadata(
            name="Chapter_12_Managing_Marketing_Communications",
            description=chap12_desc,
                            
        ),
    ),
     # Chapter 13 
    QueryEngineTool(
        query_engine=chap13_engine,
        metadata=ToolMetadata(
            name="Chapter_13_Designing_an_Integrated_Marketing_Campaign_in_the_Digital_Age",
            description=chap13_desc,
                            
        ),
    ),
     # Chapter 14 
    QueryEngineTool(
        query_engine=chap14_engine,
        metadata=ToolMetadata(
            name="Chapter_14_Personal_Selling_and_Direct_Marketing",
            description=chap14_desc,
                            
        ),
    ),
     # Chapter 15 
    QueryEngineTool(
        query_engine=chap15_engine,
        metadata=ToolMetadata(
            name="Chapter_15_Designing_and_Managing_Distribution_Channels",
            description=chap15_desc,
                            
        ),
    ),
     # Chapter 16 
    QueryEngineTool(
        query_engine=chap16_engine,
        metadata=ToolMetadata(
            name="Chapter_16_Managing_Retailing",
            description=chap16_desc,
                            
        ),
    ), 
    # Chapter 17 
    QueryEngineTool(
        query_engine=chap17_engine,
        metadata=ToolMetadata(
            name="Chapter_17_Driving_Growth_in_Competitive_Markets",
            description=chap17_desc,
                            
        ),
    ), 
    # Chapter 18 
    QueryEngineTool(
        query_engine=chap18_engine,
        metadata=ToolMetadata(
            name="Chapter_18_Developing_New_Market_Offerings",
            description=chap18_desc,
                            
        ),
    ), 
    # Chapter 19 
    QueryEngineTool(
        query_engine=chap19_engine,
        metadata=ToolMetadata(
            name="Chapter_19_Building_Customer_Loyalty",
            description=chap19_desc,
                            
        ),
    ), 
    # Chapter 20 
    QueryEngineTool(
        query_engine=chap20_engine,
        metadata=ToolMetadata(
            name="Chapter_20_Tapping_into_Global_Markets",
            description=chap20_desc,
                            
        ),
    ), 
    # Chapter 21 
    QueryEngineTool(
        query_engine=chap21_engine,
        metadata=ToolMetadata(
            name="Chapter_21_Socially_Responsible_Marketing",
            description=chap21_desc,
                            
        ),
    ),
     # Chapter 22 
    QueryEngineTool(
        query_engine=chap22_engine,
        metadata=ToolMetadata(
            name="Chapter_22_Article_Target_marketing_and_segmentation_valid_and_useful_tools_for_marketing",
            description=chap22_desc,
                            
        ),
    ),
    # Chapter 23 
    QueryEngineTool(
        query_engine=chap23_engine,
        metadata=ToolMetadata(
            name="Chapter_23_Article_Measuring_Emotions_in_the_Consumption_Experience",
            description=chap23_desc,
                            
        ),
    ),
    # # Chapter 24 
    # QueryEngineTool(
    #     query_engine=chap24_engine,
    #     metadata=ToolMetadata(
    #         name="Chapter_24_Consumers_perception_of_organic_A_review",
    #         description=chap24_desc,
                            
    #     ),
    # ),
    # Chapter 25 
    QueryEngineTool(
        query_engine=chap25_engine,
        metadata=ToolMetadata(
            name="Chapter_25_Book_consuming_experience",
            description=chap25_desc,
                            
        ),
    ),
     # Chapter 26 
    QueryEngineTool(
        query_engine=chap26_engine,
        metadata=ToolMetadata(
            name="Chapter_26_Article_An_Exercise_in_Personal_Exploration",
            description=chap26_desc,
                            
        ),
    ),
    # Chapter 27 
    QueryEngineTool(
        query_engine=chap27_engine,
        metadata=ToolMetadata(
            name="Chapter_27_Article_Consumer_behaviour",
            description=chap27_desc,      
        ),
    ),
    # Chapter 28 
    QueryEngineTool(
        query_engine=chap28_engine,
        metadata=ToolMetadata(
            name="Chapter_28_Article_Emotions_in_consumer_behavior_a_hierarchical_approach",
            description=chap28_desc,
                            
        ),
    ),
    # Chapter 29 
    QueryEngineTool(
        query_engine=chap29_engine,
        metadata=ToolMetadata(
            name="Chapter_29_Article_The_Family_Life_Cycle_A_Demographic_Analysis",
            description=chap29_desc,
                            
        ),
    ),
    # Chapter 30 
    QueryEngineTool(
        query_engine=chap30_engine,
        metadata=ToolMetadata(
            name="Chapter_30_Book_This_is_Marketing",
            description=chap30_desc,
                            
        ),
    ),
    # Chapter 31 
    QueryEngineTool(
        query_engine=chap31_engine,
        metadata=ToolMetadata(
            name="Chapter_31_Book_MARKETING_THE_BASICS",
            description=chap31_desc,
                            
        ),
    ),
    # Chapter 32 
    QueryEngineTool(
        query_engine=chap32_engine,
        metadata=ToolMetadata(
            name="Chapter_32_Book_marketing_stratégique_et_operationnel",
            description=chap32_desc,
                            
        ),
    ),
]

