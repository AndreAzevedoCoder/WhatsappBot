from selenium import webdriver
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.common.by import By
from selenium.common.exceptions import NoSuchElementException
import time
import re

chrome_options = webdriver.ChromeOptions() #Opcoes do Browser
#chrome_options.add_argument('--headless')
chrome_options.add_argument('--no-sandbox')
chrome_options.add_argument('--disable-dev-shm-usage')
driver = webdriver.Chrome(chrome_options=chrome_options) # Abrir o Browser
driver.get("https://web.whatsapp.com/") #Link do site

wait = WebDriverWait(driver, 10)
wait5 = WebDriverWait(driver, 5)

try:
    input("Escaneie o QR e depois pressione ENTER")
except:
    print("Escaneado")



MensagensPraMandar = [
    "Ola $NomeDoCliente$ , \n Digite: */Licoes* para ver todas as licoes de casa \n Digite: */Provas* para ver todas as provas marcadas \n Digite */AgendarLicao* para agendar uma licao \n Digite */AgendarProva* para agendar uma prova" + Keys.ENTER,
    "$TodasAsLicoes$",
    "$TodasAsProvas$",
    ]
MensagensAtivadoras = ["/INICIAR","/LICOES","/PROVAS"]


def VerificarSeElementoExistePorXPATH(xpath):
    try:
        driver.find_element_by_xpath(xpath)
    except NoSuchElementException:
        return False
    return True


def VerificarMensagens():
    achoutudo = False
    for i in range(1,200):
        if achoutudo != True:
            msg = '/html/body/div/div/div/div[3]/div/div[2]/div[1]/div/div/div['
            msg += str(i)
            msg += ']/div/div/div[2]/div[2]/div[1]/span/span'

            if VerificarSeElementoExistePorXPATH(msg):
                Mensagem = driver.find_element_by_xpath(msg)
                MensagemTexto = Mensagem.text
                for i in range(len(MensagensAtivadoras)):
                    if(MensagemTexto.upper() == MensagensAtivadoras[i]):
                        MandarMensagem(i,Mensagem)
            else:
                achoutudo = True
                print("Pegou primeiras mensagens")


def PegarDonoDaMensagem():
    DonoDaMensagemXPATH = driver.find_element_by_xpath('/html/body/div/div/div/div[4]/div/header/div[2]/div/div/span')
    DonoDaMensagem = DonoDaMensagemXPATH.text
    return DonoDaMensagem


def MandarMensagem(index,mensagem):
    #Selecionando mensagem
    mensagem.click()
    #Pegando o dono da mensagem
    DonoDaMensagem = PegarDonoDaMensagem()
    #Esperando um pouco

    # Selecionando o input box
    inp_xpath = "//div[@contenteditable='true']"
    input_box = wait.until(EC.presence_of_element_located((
        By.XPATH, inp_xpath)))


    #Tratando mensagem
    MensagemTratada = TratarMensagem(MensagensPraMandar[index],DonoDaMensagem)

    # Mandando mensagem
    input_box.send_keys( Keys.ENTER + MensagemTratada + Keys.SPACE) # + Keys.ENTER 
    # Reduza o tempo caso for mt grande

    input_box.send_keys(Keys.ENTER)
    print("Mandou a mensagem")

def PegarLicoes():
    try:
        Licoes = open('Licoes.csv','r').read()
        return Licoes
    except:
        print("Erro ao abrir CSV Licoes")

def PegarProvas():
    try:
        Provas = open('Provas.csv','r').read()
        return Provas
    except:
        print("Erro ao abrir CSV Licoes")
def TratarMensagem(MensagemASerTratada,DonoDaMensagem):
    MensagemTratada = MensagemASerTratada

    if MensagemASerTratada == "$TodasAsLicoes$":
        MensagemTratada = MensagemASerTratada.replace("$TodasAsLicoes$", PegarLicoes())
        return MensagemTratada

    if MensagemASerTratada == "$TodasAsProvas$":
        MensagemTratada = MensagemASerTratada.replace("$TodasAsProvas$", PegarProvas())
        return MensagemTratada
    
    MensagemTratada = MensagemASerTratada.replace("$NomeDoCliente$", DonoDaMensagem)
    
    return MensagemTratada


while True:
    VerificarMensagens()

