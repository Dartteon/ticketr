'use strict';

var React = require('react');

var socket = io.connect();

var QueueStatus = React.createClass({
	render() {
		return (
			<div>
			{console.log("queue is: ", this.props.queue)}
			{console.log("ticket is: ", this.props.ticket)}
			{
				this.props.ticket != null ?
				<div>
					<p>No.of people in front: {this.props.ticket.num_in_front}</p>
					<p>Estimated waiting time: {this.props.ticket.est_wait_time}</p>
				</div>
				:
				(
					this.props.queue != null ?
				
					<div>
						<p>No.of people in front: {this.props.queue.num_in_front}</p>
						<p>Estimated waiting time: {this.props.queue.est_wait_time}</p>
					</div>
					:

					<div> No this.props.queue nor props.ticket passed</div>
				)
			}
			</div>
			
		);
	}
});

var TicketStatus = React.createClass({
	sendTicketRequestToBackend() {
		var custId = 'def';
		socket.emit('receive:ticketrequest', custId);
	}, 
	render() {
		return (
			<div>
			{
				this.props.ticket == null ?
					<div><button onClick={this.sendTicketRequestToBackend}>Get Ticket</button></div>
				: 
				<div>
					<p>{this.props.ticket.ticket_num}</p>
				</div>
			}
				
			</div>
		);
	}
});

var UsersList = React.createClass({
	render() {
		return (
			<div className='users'>
				<h3> Online Users </h3>
				<ul>
					{
						this.props.users.map((user, i) => {
							return (
								<li key={i}>
									{user}
								</li>
							);
						})
					}
				</ul>				
			</div>
		);
	}
});

var Message = React.createClass({
	render() {
		return (
			<div className="message">
				<strong>{this.props.user} :</strong> 
				<span>{this.props.text}</span>		
			</div>
		);
	}
});

var MessageList = React.createClass({
	render() {
		return (
			<div className='messages'>
				<h2> Conversation: </h2>
				{
					this.props.messages.map((message, i) => {
						return (
							<Message
								key={i}
								user={message.user}
								text={message.text} 
							/>
						);
					})
				} 
			</div>
		);
	}
});

var MessageForm = React.createClass({

	getInitialState() {
		return {text: ''};
	},

	handleSubmit(e) {
		e.preventDefault();
		var message = {
			user : this.props.user,
			text : this.state.text
		}
		this.props.onMessageSubmit(message);	
		this.setState({ text: '' });
	},

	changeHandler(e) {
		this.setState({ text : e.target.value });
	},

	render() {
		return(
			<div className='message_form'>
				<h3>Write New Message</h3>
				<form onSubmit={this.handleSubmit}>
					<input
						onChange={this.changeHandler}
						value={this.state.text}
					/>
				</form>
			</div>
		);
	}
});












var ChangeNameForm = React.createClass({
	getInitialState() {
		return {newName: ''};
	},

	onKey(e) {
		this.setState({ newName : e.target.value });
	},

	handleSubmit(e) {
		e.preventDefault();
		var newName = this.state.newName;
		this.props.onChangeName(newName);	
		this.setState({ newName: '' });
	},

	render() {
		return(
			<div className='change_name_form'>
				<h3> Change Name </h3>
				<form onSubmit={this.handleSubmit}>
					<input
						onChange={this.onKey}
						value={this.state.newName} 
					/>
				</form>	
			</div>
		);
	}
});

var App = React.createClass({

	getInitialState() {
		return {users: [], messages:[], text: '', queue: null, ticket: 
		null};
	},

	componentDidMount() {
		socket.on('init', this._initialize);
		socket.on('send:message', this._messageRecieve);
		socket.on('user:join', this._userJoined);
		socket.on('send:ticket', this._receiveTicket);
		socket.on('send:queue', this._receiveQueue);
		this.sendCustomerIdToBackend();
	},

	_initialize(data) {
		var {users, name, queue, ticket} = data;
		this.setState({users, user: name, queue: queue, ticket: ticket});
	},

	_receiveTicket(data) {
		console.log("Ticket received " + JSON.stringify(data));
		var ticket = data;
		this.setState({ticket: ticket});
	},

	_receiveQueue(data) {
		var queue = data;
		this.setState({queue: queue});
	},

	_messageRecieve(message) {
		var {messages} = this.state;
		messages.push(message);
		this.setState({messages});
	},

	_userJoined(data) {
		var {users, messages} = this.state;
		var {name} = data;
		users.push(name);
		messages.push({
			user: 'APPLICATION BOT',
			text : name +' Joined'
		});
		this.setState({users, messages});
	},

	_userLeft(data) {
		var {users, messages} = this.state;
		var {name} = data;
		var index = users.indexOf(name);
		users.splice(index, 1);
		messages.push({
			user: 'APPLICATION BOT',
			text : name +' Left'
		});
		this.setState({users, messages});
	},

	_userChangedName(data) {
		var {oldName, newName} = data;
		var {users, messages} = this.state;
		var index = users.indexOf(oldName);
		users.splice(index, 1, newName);
		messages.push({
			user: 'APPLICATION BOT',
			text : 'Change Name : ' + oldName + ' ==> '+ newName
		});
		this.setState({users, messages});
	},

	sendCustomerIdToBackend() {
		var custId = 'abc';
		socket.emit('receive:customerid', custId);
	},

	handleMessageSubmit(message) {
		var {messages} = this.state;
		messages.push(message);
		this.setState({messages});
		socket.emit('send:message', message);
	},

	handleChangeName(newName) {
		var oldName = this.state.user;
		socket.emit('change:name', { name : newName}, (result) => {
			if(!result) {
				return alert('There was an error changing your name');
			}
			var {users} = this.state;
			var index = users.indexOf(oldName);
			users.splice(index, 1, newName);
			this.setState({users, user: newName});
		});
	},

	render() {
		return (
			<div>
				<QueueStatus 
					queue={this.state.queue}
					ticket={this.state.ticket}
				/>
				<TicketStatus
					ticket={this.state.ticket}
				/>
				<UsersList
					users={this.state.users}
				/>
				<MessageList
					messages={this.state.messages}
				/>
				<MessageForm
					onMessageSubmit={this.handleMessageSubmit}
					user={this.state.user}
				/>
				<ChangeNameForm
					onChangeName={this.handleChangeName}
				/>
				
				<MessageForm
					onMessageSubmit={this.handleMessageSubmit}
					user={this.state.user}
				/>
			</div>
		);
	}
});

React.render(<App/>, document.getElementById('app'));