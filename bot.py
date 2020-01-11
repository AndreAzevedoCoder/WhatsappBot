from selenium import webdriver
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.common.by import By
from selenium.common.exceptions import NoSuchElementException
import time

#Opcoes do Browser
chrome_options = webdriver.ChromeOptions()
#chrome_options.add_argument('--headless')
chrome_options.add_argument('--no-sandbox')
chrome_options.add_argument('--disable-dev-shm-usage')


# Abrir o Browser
driver = webdriver.Chrome(chrome_options=chrome_options)


#Link do site
driver.get("https://web.whatsapp.com/")

wait = WebDriverWait(driver, 10)
wait5 = WebDriverWait(driver, 5)


#Esperar escanear QR Code
input("Escaneie o QR e depois pressione ENTER")


MensagensPraMandar = [
    "Ola $NomeDoCliente$ , obrigado por utilizar" + Keys.ENTER,
    ]
MensagensAtivadoras = ["/iniciar"]


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
                    if(MensagemTexto == MensagensAtivadoras[i]):
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
    time.sleep(2)
    # Selecionando o input box
    inp_xpath = "//div[@contenteditable='true']"
    input_box = wait.until(EC.presence_of_element_located((
        By.XPATH, inp_xpath)))
    time.sleep(1)

    #Tratando mensagem
    MensagemTratada = TratarMensagem(MensagensPraMandar[index],DonoDaMensagem)

    # Mandando mensagem
    input_box.send_keys( Keys.ENTER + MensagemTratada + Keys.SPACE) # + Keys.ENTER 
    # Reduza o tempo caso for mt grande
    time.sleep(6)
    input_box.send_keys(Keys.ENTER)
    print("Mandou a mensagem")


def TratarMensagem(MensagemASerTratada,DonoDaMensagem):
    MensagemTratada = MensagemASerTratada.replace("$NomeDoCliente$", DonoDaMensagem)
    return MensagemTratada


while True:
    VerificarMensagens()
    time.sleep(100)








