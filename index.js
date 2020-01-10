(() => {
	//?
	//? GLOBAL VARS AND CONFIGS
	//?
	var lastMessageOnChat = false;
	var ignoreLastMsg = {};
	var elementConfig = {
		"chats": [0, 0, 5, 2, 0, 3, 0, 0, 0],
		"chat_icons": [0, 0, 1, 1, 1, 0],
		"chat_title": [0, 0, 1, 0, 0, 0, 0],
		"chat_lastmsg": [0, 0, 1, 1, 0, 0],
		"chat_active": [0, 0],
		"selected_title": [0, 0, 5, 3, 0, 1, 1, 0, 0, 0, 0]
	};


	//?
	//? FUNCTIONS
	//?

	//TODO GERAR NUMERO ALEATORIO
	function rand(high, low = 0) {
		return Math.floor(Math.random() * (high - low + 1) + low);
	}
	
	function getElement(id, parent){
		if (!elementConfig[id]){
			return false;
		}
		var elem = !parent ? document.body : parent;
		var elementArr = elementConfig[id];
		elementArr.forEach(function(pos) {
			if (!elem.childNodes[pos]){
				return false;
			}
			elem = elem.childNodes[pos];
		});
		return elem;
	}
	
	function getLastMsg(){
		var messages = document.querySelectorAll('.msg');
		var pos = messages.length-1;
		
		while (messages[pos] && (messages[pos].classList.contains('msg-system') || messages[pos].querySelector('.message-in'))){
			pos--;
			if (pos <= -1){
				return false;
			}
		}
		if (messages[pos] && messages[pos].querySelector('.selectable-text')){
			return messages[pos].querySelector('.selectable-text').innerText.trim();
		} else {
			return false;
		}
	}
	
	function getUnreadChats(){
		var unreadchats = [];
		var chats = getElement("chats");
		if (chats){
			chats = chats.childNodes;
			for (var i in chats){
				if (!(chats[i] instanceof Element)){
					continue;
				}
				var icons = getElement("chat_icons", chats[i]).childNodes;
				if (!icons){
					continue;
				}
				for (var j in icons){
					if (icons[j] instanceof Element){
						if (!(icons[j].childNodes[0].getAttribute('data-icon') == 'muted' || icons[j].childNodes[0].getAttribute('data-icon') == 'pinned')){
							unreadchats.push(chats[i]);
							break;
						}
					}
				}
			}
		}
		return unreadchats;
	}
	
	function didYouSendLastMsg(){
		var messages = document.querySelectorAll('.msg');
		if (messages.length <= 0){
			return false;
		}
		var pos = messages.length-1;
		
		while (messages[pos] && messages[pos].classList.contains('msg-system')){
			pos--;
			if (pos <= -1){
				return -1;
			}
		}
		if (messages[pos].querySelector('.message-out')){
			return true;
		}
		return false;
	}

	//TODO CHAMAR A FUNCAO PRINCIPAL NOVAMENTE
	const goAgain = (fn, sec) => {
		// const chat = document.querySelector('div.chat:not(.unread)')
		// selectChat(chat)
		setTimeout(fn, sec * 750)
	}

	//TODO DISPATH CLICK POR INSTANCIA 
	const eventFire = (el, etype) => {
		var evt = document.createEvent("MouseEvents");
		evt.initMouseEvent(etype, true, true, window,0, 0, 0, 0, 0, false, false, false, false, 0, null);
		el.dispatchEvent(evt);
	}

	//TODO SELECIONAR UM CHAT PARA MOSTRAR O PV
	const selectChat = (chat, cb) => {
		const title = getElement("chat_title",chat).title;
		eventFire(chat.firstChild.firstChild, 'mousedown');
		if (!cb) return;
		const loopFewTimes = () => {
			setTimeout(() => {
				const titleMain = getElement("selected_title").title;
				if (titleMain !== undefined && titleMain != title){
					console.log('Ainda não');
					return loopFewTimes();
				}
				return cb();
			}, 300);
		}

		loopFewTimes();
	}

	//TODO MANDAR MENSAGEM
	const sendMessage = (chat, message, cb) => {
		//TODO EVITAR MANDAR MENSAGEM DUPLICADA
		var title;

		if (chat){
			title = getElement("chat_title",chat).title;
		} else {
			title = getElement("selected_title").title;
		}
		ignoreLastMsg[title] = message;
		
		messageBox = document.querySelectorAll("[contenteditable='true']")[0];

		//TODO ADICIONAR TEXTO EM CAIXA DE TEXTO
		messageBox.innerHTML = message.replace(/  /gm,'');

		//TODO FORCAR ATUALIZACAO
		event = document.createEvent("UIEvents");
		event.initUIEvent("input", true, true, window, 1);
		messageBox.dispatchEvent(event);

		//TODO CLICAR NO BOTAO ENVIAR
		eventFire(document.querySelector('span[data-icon="send"]'), 'click');

		cb();
	}

	//?
	//? MAIN LOGIC
    //?
    
	const start = (_chats, cnt = 0) => {
		//TODO CONSEGUIR NOVA MENSAGEM NAO LIDA
		const chats = _chats || getUnreadChats();
		const chat = chats[cnt];
		
		var processLastMsgOnChat = false;
		var lastMsg;
		
		if (!lastMessageOnChat){
			if (false === (lastMessageOnChat = getLastMsg())){
				lastMessageOnChat = true; //TODO EVITAR IF SER VERDADEIRO O TEMPO TODO
			} else {
				lastMsg = lastMessageOnChat;
			}
		} else if (lastMessageOnChat != getLastMsg() && getLastMsg() !== false && !didYouSendLastMsg()){
			lastMessageOnChat = lastMsg = getLastMsg();
			processLastMsgOnChat = true;
		}
		
		if (!processLastMsgOnChat && (chats.length == 0 || !chat)) {
			console.log(new Date(), 'Nada para fazer... (1)', chats.length, chat);
			return goAgain(start, 3);
		}

		//TODO CONSEGUIR INFORMACOES
		var title;
		if (!processLastMsgOnChat){
			title = getElement("chat_title",chat).title + '';
			lastMsg = (getElement("chat_lastmsg", chat) || { innerText: '' }).title.replace(/[\u2000-\u206F]/g, ""); //TODO A ULTIMA MENSAGEM RETORNA NULL QUANDO ESTA DIGITANDO
		} else {
			title = getElement("selected_title").title;
		}
		//TODO EVITAR MANDAR INFORMACOES DUPLICADAS
		if (ignoreLastMsg[title] && (ignoreLastMsg[title]) == lastMsg) {
			console.log(new Date(), 'Nada para fazer... (2)', title, lastMsg);
			return goAgain(() => { start(chats, cnt + 1) }, 0.1);
		}




        //TODO RESPOSTAS: 
        
		let sendText

		if (lastMsg.toUpperCase().indexOf('/INICIAR') > -1){
			sendText = `
				Prazer ${title}! Alguns comandos:
                
				1. */REGISTRAR*
                2. */PERFIL*
                3. */HORARIOS*
                4. */CONTATO*
                
                `

		}

		if (lastMsg.toUpperCase().indexOf('/REGISTRAR') > -1){
			sendText = `
                Digite seu nome:
                `
		}

		if (lastMsg.toUpperCase().indexOf('/PERFIL') > -1){
            sendText = `
            Digite seu nome:
            `
		}


        
        if (lastMsg.toUpperCase().indexOf('/CONTATO') > -1){
            sendText = `
            Facebook: teste123
            Instagram: @teste123
            Telefone: 11966666666
            `
		}
        
        if (lastMsg.toUpperCase().indexOf('/HORARIOS') > -1){
            sendText = `
            PROXIMO TORNEIO DIA: ***
            `
        }
        //TODO NADA PARA MANDAR
        
		if (!sendText) {
			ignoreLastMsg[title] = lastMsg;
			console.log(new Date(), 'Mensagem ignorada -> ', title, lastMsg);
			return goAgain(() => { start(chats, cnt + 1) }, 0.1);
		}

		console.log(new Date(), 'Nova mensagem para processar -> ', title, lastMsg);

		//TODO SELECIONAR CHAT E MANDAR MENSAGEM
		if (!processLastMsgOnChat){
			selectChat(chat, () => {
				console.log(chat)
				sendMessage(chat, sendText.trim(), () => {
					goAgain(() => { start(chats, cnt + 1) }, 1);
				});
			})

		} else {
			sendMessage(null, sendText.trim(), () => {
				goAgain(() => { start(chats, cnt + 1) }, 1);
			});
		}
	}
	start();
})()
