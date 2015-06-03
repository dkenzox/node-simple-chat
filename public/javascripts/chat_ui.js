
	
	function divEscapedContentElement(message) {
		return $('<div></div>').text(message);
	}

	function divSystemContentElement(message) {
		return $('<div></div>').html('<i>' + message + '</i>');
	}

	function processUserInput(chatApp, socket) {
		var message = $('#send-message').val();
		var systemMessage;

		if (message.charAt(0) === '/') {
			systemMessage = chatApp.processCommand(message);
			if (systemMessage) {
				$('#messages').append(divSystemContentElement(systemMessage));
			}
		} else {
			chatApp.sendMessage($('#room').text(), message);
			$('messages').append(divEscapedContentElement(message));
			$('messages').scrollTop($('#messages').prop('scrollHeight'));
		}

		$('#send-message').val('');
	}

	var socket = io.connect();

	jQuery(document).ready(function($) {
		var chatApp = new Chat(socket);

		socket.on('nameResult', function(result) {
			var message;

			if (result.success) {
				message = 'You are now ' + result.name + '.';
			} else {
				message = result.message;
			}

			$('#messages').append(divSystemContentElement(message));
		});

		socket.on('joinResult', function(result) {
			$('#room').text(result.room);
			$('#messages').append(divSystemContentElement('Room changed.'));
		});

		socket.on('message', function(message) {
			var newElement = $('<div></div>').text(message.text);
			$('#messages').append(newElement);
		});

		socket.on('rooms', function(rooms) {
			$('room-list').empty();

			for(var room in rooms) {
				room = room.substring(1, room.length);
				if(room !== '') {
					$('#room-list').append(divEscapedContentElement(room));
				}
			}

			$('#room-list div').on('click', function() {
				chatApp.processCommand('/join ' + $(this).text());
				$('#send-message').focus();
			});

		});

		$('#send-message').focus();

		$('#send-form').on('submit', function(evt) {
			evt.preventDefault();
			processUserInput(chatApp, socket);
			return false;
		});

	});
