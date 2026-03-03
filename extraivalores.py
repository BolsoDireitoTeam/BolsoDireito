import re #biblioteca(?) pra buscar padrão em texto (funcao findall)
import pdfplumber #biblioteca que extrai texto de pdfs

valores = []

with pdfplumber.open("exemplodepdf.pdf") as pdf: #abre o pdf e chama só de pdf pra facilitar
    for pagina in pdf.pages: #para cada pasta no pdf
        texto = pagina.extract_text() #extrai o texto do pdf e guarda na var texto
        
        encontrados = re.findall(r'\b\d{1,3}(?:\.\d{3})*,\d{2}\b', texto) #filtra o texto pra pegar só os valores em dinheiro
        valores.extend(encontrados) #adiciona vários itens à lista valores de uma vez só, aumentando ela 

print(valores)

#esse codigo nao diferencia ganho de despesa, e nao pega o autor da despesa. exclusivamente retira valores monetarios do pdf.