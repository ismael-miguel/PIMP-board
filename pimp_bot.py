import sys
from selenium import webdriver

def login(driver, email, password):
	driver.get("https://codereview.stackexchange.com/users/login")

	driver.find_element_by_name("email").send_keys(email)
	driver.find_element_by_name("password").send_keys(password)

	driver.find_element_by_name("submit-button").click()



email = raw_input("Email: ") # more user freidnly because not everyone knows how to hide command line history
password = raw_input("Password: ") 
driver = webdriver.Firefox()

login(driver, email, password)

print driver.find_element_by_name("title").get_attribue("innerHTML")

# {"EthanBierlein":true,"JaDogg":true,"DJanssens":true,"Hosch250":true,"Jamal":true,"Legato":true,"SirPython":true}