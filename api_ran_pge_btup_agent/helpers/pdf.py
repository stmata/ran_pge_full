import os
from llama_index import StorageContext, VectorStoreIndex, load_index_from_storage
from llama_index.readers import PDFReader
from dotenv import load_dotenv

load_dotenv()
def get_index(data, index_name):
    index = None
    if not os.path.exists(index_name):
        print("building index", index_name)
        index = VectorStoreIndex.from_documents(data, show_progress=True)
        index.storage_context.persist(persist_dir=index_name)
    else:
        index = load_index_from_storage(
            StorageContext.from_defaults(persist_dir=index_name)
        )

    return index

path = './data'

'''
Chapter One
'''
pdf_path = os.path.join(path, "Chap1.pdf")
chap1_pdf = PDFReader().load_data(file=pdf_path)
chap1_index = get_index(chap1_pdf, "Chapter_1")
chap1_engine = chap1_index.as_query_engine()

'''
Chapter Two
'''
pdf_path = os.path.join("data", "Chap2.pdf")
chap2_pdf = PDFReader().load_data(file=pdf_path)
chap2_index = get_index(chap2_pdf, "Chapter_2")
chap2_engine = chap2_index.as_query_engine()

'''
Chapter Three
'''
pdf_path = os.path.join("data", "Chap3.pdf")
chap3_pdf = PDFReader().load_data(file=pdf_path)
chap3_index = get_index(chap3_pdf, "Chapter_3")
chap3_engine = chap3_index.as_query_engine()

'''
Chapter Four
'''
pdf_path = os.path.join("data", "Chap4.pdf")
chap4_pdf = PDFReader().load_data(file=pdf_path)
chap4_index = get_index(chap4_pdf, "Chapter_4")
chap4_engine = chap4_index.as_query_engine()

'''
Chapter Five
'''
pdf_path = os.path.join("data", "Chap5.pdf")
chap5_pdf = PDFReader().load_data(file=pdf_path)
chap5_index = get_index(chap5_pdf, "Chapter_5")
chap5_engine = chap5_index.as_query_engine()

'''
Chapter Six
'''
pdf_path = os.path.join("data", "Chap6.pdf")
chap6_pdf = PDFReader().load_data(file=pdf_path)
chap6_index = get_index(chap6_pdf, "Chapter_6")
chap6_engine = chap6_index.as_query_engine()

'''
Chapter Seven
'''
pdf_path = os.path.join("data", "Chap7.pdf")
chap7_pdf = PDFReader().load_data(file=pdf_path)
chap7_index = get_index(chap7_pdf, "Chapter_7")
chap7_engine = chap7_index.as_query_engine()

'''
Chapter Eight
'''
pdf_path = os.path.join("data", "Chap8.pdf")
chap8_pdf = PDFReader().load_data(file=pdf_path)
chap8_index = get_index(chap8_pdf, "Chapter_8")
chap8_engine = chap8_index.as_query_engine()

'''
Chapter Nine
'''
pdf_path = os.path.join("data", "Chap9.pdf")
chap9_pdf = PDFReader().load_data(file=pdf_path)
chap9_index = get_index(chap9_pdf, "Chapter_9")
chap9_engine = chap9_index.as_query_engine()

'''
Chapter Ten
'''
pdf_path = os.path.join("data", "Chap10.pdf")
chap10_pdf = PDFReader().load_data(file=pdf_path)
chap10_index = get_index(chap10_pdf, "Chapter_10")
chap10_engine = chap10_index.as_query_engine()

'''
Chapter Eleven
'''
pdf_path = os.path.join("data", "Chap11.pdf")
chap11_pdf = PDFReader().load_data(file=pdf_path)
chap11_index = get_index(chap11_pdf, "Chapter_11")
chap11_engine = chap11_index.as_query_engine()

'''
Chapter Twelve
'''
pdf_path = os.path.join("data", "Chap12.pdf")
chap12_pdf = PDFReader().load_data(file=pdf_path)
chap12_index = get_index(chap12_pdf, "Chapter_12")
chap12_engine = chap12_index.as_query_engine()

'''
Chapter 13
'''
pdf_path = os.path.join("data", "Chap13.pdf")
chap13_pdf = PDFReader().load_data(file=pdf_path)
chap13_index = get_index(chap13_pdf, "Chapter_13")
chap13_engine = chap13_index.as_query_engine()

'''
Chapter 14
'''
pdf_path = os.path.join("data", "Chap14.pdf")
chap14_pdf = PDFReader().load_data(file=pdf_path)
chap14_index = get_index(chap14_pdf, "Chapter_14")
chap14_engine = chap14_index.as_query_engine()

'''
Chapter 15
'''
pdf_path = os.path.join("data", "Chap15.pdf")
chap15_pdf = PDFReader().load_data(file=pdf_path)
chap15_index = get_index(chap15_pdf, "Chapter_15")
chap15_engine = chap15_index.as_query_engine()

'''
Chapter 16
'''
pdf_path = os.path.join("data", "Chap16.pdf")
chap16_pdf = PDFReader().load_data(file=pdf_path)
chap16_index = get_index(chap16_pdf, "Chapter_16")
chap16_engine = chap16_index.as_query_engine()

'''
Chapter 17
'''
pdf_path = os.path.join("data", "Chap17.pdf")
chap17_pdf = PDFReader().load_data(file=pdf_path)
chap17_index = get_index(chap17_pdf, "Chapter_17")
chap17_engine = chap17_index.as_query_engine()

'''
Chapter 18
'''
pdf_path = os.path.join("data", "Chap18.pdf")
chap18_pdf = PDFReader().load_data(file=pdf_path)
chap18_index = get_index(chap18_pdf, "Chapter_18")
chap18_engine = chap18_index.as_query_engine()

'''
Chapter 19
'''
pdf_path = os.path.join("data", "Chap19.pdf")
chap19_pdf = PDFReader().load_data(file=pdf_path)
chap19_index = get_index(chap19_pdf, "Chapter_19")
chap19_engine = chap19_index.as_query_engine()
'''
Chapter 20
'''
pdf_path = os.path.join("data", "Chap20.pdf")
chap20_pdf = PDFReader().load_data(file=pdf_path)
chap20_index = get_index(chap20_pdf, "Chapter_20")
chap20_engine = chap20_index.as_query_engine()

'''
Chapter 21
'''
pdf_path = os.path.join("data", "Chap21.pdf")
chap21_pdf = PDFReader().load_data(file=pdf_path)
chap21_index = get_index(chap21_pdf, "Chapter_21")
chap21_engine = chap21_index.as_query_engine()

'''
Article: Target marketing and segmentation: valid and useful tools for marketing
Dennis J. Cahill
Chapter 22
'''
pdf_path = os.path.join("data", "Chap22.pdf")
chap22_pdf = PDFReader().load_data(file=pdf_path)
chap22_index = get_index(chap22_pdf, "Chapter_22")
chap22_engine = chap22_index.as_query_engine()

'''
Article: Measuring Emotions in the Consumption Experience
MARSHA L. RICHINS
'''
pdf_path = os.path.join("data", "Chap23.pdf")
chap23_pdf = PDFReader().load_data(file=pdf_path)
chap23_index = get_index(chap23_pdf, "Chapter_23")
chap23_engine = chap23_index.as_query_engine()

'''
Article: Consumers’ perception of organic product characteristics. A review
Rosa Schleenbecker , Ulrich Hamm
'''
pdf_path = os.path.join("data", "Chap24.pdf")
chap24_pdf = PDFReader().load_data(file=pdf_path)
chap24_index = get_index(chap24_pdf, "Chapter_24")
chap24_engine = chap24_index.as_query_engine()

'''
Book: consuming experience
ANTONELLA C A R AND BERNARD COVA
'''
pdf_path = os.path.join("data", "Chap25.pdf")
chap25_pdf = PDFReader().load_data(file=pdf_path)
chap25_index = get_index(chap25_pdf, "Chapter_25")
chap25_engine = chap25_index.as_query_engine()

'''
Article: An Exercise in Personal Exploration:
Maslow’s Hierarchy of Needs.
Bob Poston, cst
'''
pdf_path = os.path.join("data", "Chap26.pdf")
chap26_pdf = PDFReader().load_data(file=pdf_path)
chap26_index = get_index(chap26_pdf, "Chapter_26")
chap26_engine = chap26_index.as_query_engine()

'''
Article: Consumer behaviour
From Wikipedia
'''
pdf_path = os.path.join("data", "Chap27.pdf")
chap27_pdf = PDFReader().load_data(file=pdf_path)
chap27_index = get_index(chap27_pdf, "Chapter_27")
chap27_engine = chap27_index.as_query_engine()

'''
Article: Emotions in consumer behavior: a hierarchical approach
Fleur J.M. Laros, Jan-Benedict E.M. Steenkamp
'''
pdf_path = os.path.join("data", "Chap28.pdf")
chap28_pdf = PDFReader().load_data(file=pdf_path)
chap28_index = get_index(chap28_pdf, "Chapter_28")
chap28_engine = chap28_index.as_query_engine()

'''
Article:The Family Life Cycle: A DemographicAnalysis
Rob W. Lawson
'''
pdf_path = os.path.join("data", "Chap29.pdf")
chap29_pdf = PDFReader().load_data(file=pdf_path)
chap29_index = get_index(chap29_pdf, "Chapter_29")
chap29_engine = chap29_index.as_query_engine()

'''
Book: This is Marketing
Seth Godin
'''
pdf_path = os.path.join("data", "Chap30.pdf")
chap30_pdf = PDFReader().load_data(file=pdf_path)
chap30_index = get_index(chap30_pdf, "Chapter_30")
chap30_engine = chap30_index.as_query_engine()

'''
Book: MARKETING THE BASICS
Karl Moore and Niketh Pareek
'''
pdf_path = os.path.join("data", "Chap31.pdf")
chap31_pdf = PDFReader().load_data(file=pdf_path)
chap31_index = get_index(chap31_pdf, "Chapter_31")
chap31_engine = chap31_index.as_query_engine()


'''
Book: marketing stratégique et opérationnel. du marketing
à l’orientation-marché. 7e édition
Jean-Jacques Lambin Chantal de Moerloose
'''
pdf_path = os.path.join("data", "Chap32.pdf")
chap32_pdf = PDFReader().load_data(file=pdf_path)
chap32_index = get_index(chap32_pdf, "Chapter_32")
chap32_engine = chap32_index.as_query_engine()