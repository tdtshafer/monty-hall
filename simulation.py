import random
from collections import deque

def main():
	play_or_simulate_input = start_prompt()
	MontyHall = MontyHallProblemSession(switch=True)
	if play_or_simulate_input == 'i':
		print_information()
		main()
	elif play_or_simulate_input == 's':
		simulate_games(MontyHall)	
	else:
		play_game(MontyHall)

def print_information():
	info = """
	Imagine a gameshow where you are presented with three doors. Behind one of them is $1,000,000 - but the other two doors contain nothing of value. You get to choose the door you want. And after you choose, the host might give you some more information and let you change your guess, but only if you want to. Is it ever to your advantage to change your guess? Simulate a large number of games and find out!
	---
	The Monty Hall problem is a brain teaser, in the form of a probability puzzle, loosely based on the American television game show Let's Make a Deal and named after its original host, Monty Hall. The problem was originally posed (and solved) in a letter by Steve Selvin to the American Statistician in 1975. (From Wikipedia - https://en.wikipedia.org/wiki/Monty_Hall_problem)
	"""
	print(info)

def start_prompt():
	play_or_simulate_input = input("Start Menu:\nPress 's' to run a simulation\nPress 'p' to play the game yourself\nPress 'i' for information about the Monty Hall Problem\nPress ctrl+c to exit")
	if play_or_simulate_input not in ['s', 'p', 'i']:
		print("Please choose 's','p' or 'i'")
		print("Try again.")
		return start_prompt()
	else:
		return play_or_simulate_input

def request_total_games_input():
	total_games_input = input("How many total games should be played?\n")
	try:
		total_games = int(total_games_input)
	except ValueError:
		print("Make sure your input is an integer")
		return request_total_games_input()
	if total_games > 1e6:
		print("Make sure your input is less than a million")
		return request_total_games_input()
	return total_games

def request_switch_games_input(total_games):
	switch_games_input = input("How many times should the contestant switch their guess?\n")
	try:
		switch_games = int(switch_games_input)
	except ValueError:
		print("Make sure your input is an integer")
		return request_switch_games_input()
	if total_games > total_games:
		print("Make sure your input is less than the total games ({})".format(total_games))
		return request_switch_games_input()
	return switch_games

def request_player_guess_input():
	player_guess = input("Enter your door choice:\n")
	if player_guess not in ["0","1","2"]:
		print("Make sure you choose either 0, 1, or 2")
		return request_player_guess_input()
	return int(player_guess)

def request_player_switch_input():
	player_switch_input = input("Do you want to switch?\nPress 'y' for yes\nPress 'n' for no\n")
	if player_switch_input not in ["y","n"]:
		print("Make sure you choose either 'y' or 'n'")
		return request_player_switch_input()
	#return the boolean
	return player_switch_input == 'y'

def request_play_again_input():
	play_again_input = input("Track session stats and play again?\nPress 'y' for yes\nPress 'n' for no\nPress 's' for stats\n")
	if play_again_input not in ["y", "n", "s"]:
		print("Make sure you choose either 'y', 'n', or 's'")
		return play_again_input()
	return play_again_input

def process_transition(play_again_input, MontyHall):
	if play_again_input == "y":
		MontyHall.reset_game()
		play_game(MontyHall)
	elif play_again_input == "n":
		main()
	else:
		#view stats option, play_again_input == 's'
		MontyHall.print_analysis()
		process_transition(
			request_play_again_input(),
			MontyHall
		)

def simulate_games(MontyHall):
	total_games = request_total_games_input()
	switch_games = request_switch_games_input(total_games)
	
	MontyHall = MontyHallProblemSession(switch=True)
	for x in range(total_games):
		print("GAME {}".format(x+1))
		switch = x < switch_games-1
		print("SWITCH: {}".format(switch))
		simulate_one_game(MontyHall, switch)
		MontyHall.reset_game(switch)
	print("All {} games finished!".format(total_games))
	MontyHall.print_analysis()

	#simple redirect to start screen
	main()

def simulate_one_game(MontyHall, switch):
	#contestant guesses
	MontyHall.make_guess()
		
	#host eliminates one wrong answer
	MontyHall.eliminate_one_wrong_answer()

	#contestant decides to switch or not
	MontyHall.make_final_guess()
		
	#the big reveal
	MontyHall.evaluate_final_guess()

def play_game(MontyHall):
	print("Monty Hall: Choose a door: 0, 1, or 2")

	#get user input guess	
	player_guess = request_player_guess_input()
	
	#tell monty the guess
	MontyHall.make_guess(player_guess)
	
	#monty eliminates one wrong anser
	MontyHall.eliminate_one_wrong_answer()

	#get user input on switching
	player_switch = request_player_switch_input()
	
	#apply player's choice
	MontyHall.switch = player_switch
	
	#tell monty the final guess
	MontyHall.make_final_guess()
	
	#evaluate decision
	MontyHall.evaluate_final_guess()

	#play again?
	play_again_input = request_play_again_input()

	process_transition(play_again_input, MontyHall)

class MontyHallProblemSession():
	def __init__(self, switch):
		#one in three wins
		self.total_wins = 0		
		self.total_losses = 0
		self.switch_wins = 0
		self.switch_losses = 0
		self.no_switch_wins = 0
		self.no_switch_losses = 0
		self.reset_game(switch)
			
	def reset_game(self, switch=True):
		self.switch = switch
		self.doors = deque([0,1,2])
		#randomize placement of winner
		self.winning_index = random.randint(0,2)
		self.doors.rotate(self.winning_index)

	def make_guess(self, guess=None):
		#contestant makes random guess: [0,1,2]
		self.original_guess = guess or random.randint(0,2)	
		if not guess:	
			print("Monty Hall: Choose a door: 0, 1, or 2")
		print("Contestant: Hmm... I choose door {}".format(self.original_guess))

	def make_final_guess(self):
		if not self.switch:
			print("Contestant: I'm sticking with door {}!".format(self.original_guess))
			self.final_guess = self.original_guess
			return 
	
		for x in [0,1,2]:
			if x not in [self.original_guess, self.eliminated_door]:
				print("Contestant: I'm switching to door {}!".format(x))
				self.final_guess = x
				break
	
	def eliminate_one_wrong_answer(self):
		#can't eliminate the guess or the winning index
		for index, door in enumerate(self.doors):
			if index not in [self.original_guess, self.winning_index]:
				print("Monty Hall: I can tell you that door {} has no money".format(index))
				print("Monty Hall: Do you want to keep your guess of {} or switch to door {}?".format(
						self.original_guess,
						[i for i, x in enumerate(self.doors) if i not in [index, self.original_guess]][0],
				))
				self.eliminated_door = index
				break
					
	def evaluate_final_guess(self):
		if self.final_guess == self.winning_index:
			print("Monty Hall: Congrats! You won $1,000,000!")
			print("Contestant: Wahoo!")
			self.total_wins += 1
			if self.switch:
				self.switch_wins += 1
			else:
				self.no_switch_wins += 1
		else:
			print("Monty Hall: Sorry! You didn't win anything")
			print("Monty Hall: The money was behind door {}".format(self.winning_index))
			print("Contestant: Shucks")
			self.total_losses += 1
			if self.switch:
				self.switch_losses += 1
			else:
				self.no_switch_losses += 1
	
	def calculate_win_percentage(self, wins, losses):
		try:
			return round(wins/(wins+losses), 10)
		except ZeroDivisionError:
			return 0

	def print_analysis(self):
		analysis_string = """
		---
		Total Games Played: {total_games_played}
		Total Wins: {total_wins}
		Total Losses: {total_losses}
		Total Win Percentage: {total_win_percentage}
		---
		Switch Games Played: {switch_games_played}
		Switch Wins: {switch_wins}
		Switch Losses: {switch_losses}
		Switch Win Percentage: {switch_win_percentage}
		---
		No Switch Games Played: {no_switch_games_played}
		No Switch Wins: {no_switch_wins}
		No Switch Losses: {no_switch_losses}
		No Switch Win Percentage: {no_switch_win_percentage}
		---
		Percentage difference if you switch: {percentage_difference}
		"""
		data = {
			'total_games_played': self.total_wins + self.total_losses,
			'total_wins': self.total_wins,
			'total_losses': self.total_losses,
			'total_win_percentage': self.calculate_win_percentage(self.total_wins, self.total_losses),
			
			'switch_games_played': self.switch_wins + self.switch_losses,
			'switch_wins': self.switch_wins,
			'switch_losses': self.switch_losses,
			'switch_win_percentage': self.calculate_win_percentage(self.switch_wins, self.switch_losses),
			
			'no_switch_games_played': self.no_switch_wins + self.no_switch_losses,
			'no_switch_wins': self.no_switch_wins,
			'no_switch_losses': self.no_switch_losses,
			'no_switch_win_percentage': self.calculate_win_percentage(self.no_switch_wins, self.no_switch_losses),
		}
		data["percentage_difference"] = data["switch_win_percentage"] - data["no_switch_win_percentage"]
		
		print(analysis_string.format(**data))
main()

