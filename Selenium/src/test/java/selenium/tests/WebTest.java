package selenium.tests;

import static org.junit.Assert.*;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.concurrent.TimeUnit;

import org.junit.After;
import org.junit.AfterClass;
import org.junit.BeforeClass;
import org.junit.Test;
import org.openqa.selenium.By;
import org.openqa.selenium.Keys;
import org.openqa.selenium.TimeoutException;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.interactions.Actions;
import org.openqa.selenium.support.ui.ExpectedCondition;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;

import io.github.bonigarcia.wdm.ChromeDriverManager;

public class WebTest
{
	private static WebDriver driver;
	private static WebDriverWait wait;
	private static String botName = System.getenv("SLACK_BOT_NAME");
	private static String botMemberId = "";
	private static String botMemberMessageXPath = "";
	private static int lastNumResponses = 0;
	
	@BeforeClass
	public static void setUp() throws Exception 
	{
		//driver = new HtmlUnitDriver();
		ChromeDriverManager.getInstance().setup();
		driver = new ChromeDriver();
		driver.get("https://slack-cibot.slack.com/");

		// Wait until page loads and we can see a sign in button.
		wait = new WebDriverWait(driver, 30);
		wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("signin_btn")));

		// Find email and password fields.
		WebElement email = driver.findElement(By.id("email"));
		WebElement pw = driver.findElement(By.id("password"));

		// Get our email and password
		// If running this from Eclipse, you should specify these variables
		// in the run configurations.
		email.sendKeys(System.getenv("SLACK_EMAIL"));
		pw.sendKeys(System.getenv("SLACK_PASSWORD"));

		// Click
		WebElement signin = driver.findElement(By.id("signin_btn"));
		signin.click();

		// Wait until we go to general channel.
		wait.until(ExpectedConditions.titleContains("general"));

		// Switch to #selenium-bot channel and wait for it to load.
		driver.get("https://slack-cibot.slack.com/messages/selenium-bot");
		wait.until(ExpectedConditions.titleContains("selenium-bot"));

		// Make sure the bot has a message so the xPath will find something
		sendCommand("@" + botName + " help");
		TimeUnit.SECONDS.sleep(2);
		
		String xBotSearch = "//div[@class='message_content_header_left']/a[.='" + botName + "']/../../../..";
		WebElement botElement = driver.findElement(By.xpath(xBotSearch));
		botMemberId = botElement.getAttribute("data-member-id");
		botMemberMessageXPath = "//ts-message[@data-member-id='" + botMemberId + "']//span[@class='message_body']";
		lastNumResponses = driver.findElements(By.xpath(botMemberMessageXPath)).size();
	}
	
	@AfterClass
	public static void  tearDown() throws Exception
	{
		driver.close();
		driver.quit();
	}
	
	/**
	 * Helper function to make sure that we are not inside a bot message thread by sending several
	 * nonsense commands
	 * 
	 */
	@After
	public void exitBotConversation()
	{
		sendCommand("quiddilygiff");
		sendCommand("quiddilygiff");
		sendCommand("quiddilygiff");
	}
	
	/**
	 * Send a command to the channel without caring about the response
	 * @param command The command to send
	 */
	private static void sendCommand(String command)
	{
		List<String> responses = Arrays.asList();
		testCommandNResponses(command, responses);
	}
	
	/**
	 * Helper function to test a command with one expected response
	 * 
	 * @param command The command issued
	 * @param response The expected response
	 */
	private static void testCommandOneResponse(String command, String response)
	{
		List<String> responses = Arrays.asList(response);
		testCommandNResponses(command, responses);
	}
	
	/**
	 * Helper function to test a command with two expected responses
	 * 
	 * @param command The command issued
	 * @param response1 The first response
	 * @param response2 The middle response
	 */
	private static void testCommandTwoResponses(String command, String response1, String response2)
	{
		List<String> responses = Arrays.asList(response1, response2);
		testCommandNResponses(command, responses);
	}
	
	/**
	 * Helper function to test a command with three expected responses
	 * 
	 * @param command The command issued
	 * @param response1 The first response
	 * @param response2 The middle response
	 * @param response3 The last response
	 */
	private static void testCommandThreeResponses(String command, String response1, String response2, String response3)
	{
		List<String> responses = Arrays.asList(response1, response2, response3);
		testCommandNResponses(command, responses);
	}
	
	/**
	 * Helper function to test a command with n expected responses
	 * 
	 * @param command The command to issue
	 * @param responses List containing all expected responses
	 */
	private static void testCommandNResponses(String command, List<String> responses)
	{
		int numResponses = responses.size();

		// Type in the help command 
		WebElement messageBot = driver.findElement(By.id("msg_input"));
		assertNotNull(messageBot);
		Actions actions = new Actions(driver);
		actions.moveToElement(messageBot);
		actions.click();
		actions.click();		// not sure if this does anything, but keystrokes were not registering
		actions.click();
		actions.sendKeys(command);
		actions.sendKeys(Keys.RETURN);
		actions.build().perform();

		// check the responses if we want
		if (responses.size() > 0)
		{
			List<WebElement> messages = null;
			// Execute the actions and wait until the number of messages changes
			try {
				messages = waitUntilCountChanges(botMemberMessageXPath, lastNumResponses + numResponses);
			}
			catch (TimeoutException e)
			{
				// We time exceeded, but that is okay. Maybe we missed the response, 
				// 		so we will try anyway.
				 messages = driver.findElements(By.xpath(botMemberMessageXPath));
			}

			for (int i = 0; i < numResponses; i++)
			{
				WebElement testElement = messages.get(messages.size() - numResponses + i);
				assertNotNull(testElement);
				assertEquals(responses.get(i), testElement.getText());
			}
			lastNumResponses = driver.findElements(By.xpath(botMemberMessageXPath)).size();
		}
	}
	
	/**
	 * Helper function to make sure that we have all of the messages we want to check
	 * 
	 * @param xpath
	 * @param diffCount
	 * @return
	 */
	private static List<WebElement> waitUntilCountChanges(final String xpath, final int minCount)
	{
//		final int minCount = lastNumResponses + diffCount;
        WebDriverWait wait = new WebDriverWait(driver, 5);
        wait.until(new ExpectedCondition<Boolean>() {
            public Boolean apply(WebDriver driver) {
                int elementCount = driver.findElements(By.xpath(xpath)).size();
                if (elementCount >= minCount)
                    return true;
                else
                    return false;
            }
        });
        return driver.findElements(By.xpath(xpath));
    }

	/**
	 * 
	 */
	@Test
	public void helpMessage()
	{
		// GENERAL HELP
		testCommandOneResponse("@" + botName + " help", 
				"help init, help configure, help issue, help change issue, help coveralls");

		// USE CASE 1 HELP
		testCommandOneResponse("@" + botName + " help init", 
				"init travis <owner>/<repository>");
		testCommandOneResponse("@" + botName + " help configure", 
				"configure yaml <owner>/<repository>");

		testCommandOneResponse("@" + botName + " help issue", 
				"test issue");

		testCommandOneResponse("@" + botName + " help change issue", 
				"test change issue");
		
		// USE CASE 2 HELP
		// This is no longer used.
//		testCommandOneResponse("@" + botName + " help travis", 
//				"test travis");

		// USE CASE 3 HELP
		testCommandOneResponse("@" + botName + " help coveralls", 
				"test coveralls");
	}
	
	/**
	 * 
	 */
//	@Test
//	public void useCase1()
//	{
//		
//	}
	
	/**
	 * 
	 */
	@Test
	public void useCase2()
	{
		testCommandTwoResponses("@" + botName + " init travis test/demo", 
				"Travis activated for test/demo", 
				"Would you like to create a yaml file (yes/no)?");

		testCommandOneResponse("yes", 
				"Which language do you want to use ? Node.js,Ruby");

		testCommandThreeResponses("Node.js", 
				"Default coverage threshold for the current repository is set to 95%",
				"I am pushing the yaml file to the github repository",
				"Pushed the yaml file to the github repository");

		testCommandTwoResponses("@" + botName + " test last build", 
				"The last build for test/demo failed", 
				"Do you want to create an issue (yes/no)?");

		testCommandOneResponse("no", 
				"I'll not create the issue");

		testCommandTwoResponses("@" + botName + " test last build", 
				"The last build for test/demo failed", 
				"Do you want to create an issue (yes/no)?");

		testCommandOneResponse("yes", 
				"Current issue title is set to Build failure.Do you want to change the title of the issue (yes/no)");

		testCommandOneResponse("no", 
				"Please enter a comma-separated list of assignees to the issue. Ex @user1,@user2,@user3...");
		testCommandTwoResponses("@null", 
				"I am going to create an issue titled Build failure and assign it to @null",
				"Issue has been created");
	}
	
	/**
	 * 
	 */
	@Test
	public void useCase3()
	{
		testCommandTwoResponses("@" + botName + " init travis o/r",
				"Travis activated for o/r", 
				"Would you like to create a yaml file (yes/no)?");
		testCommandTwoResponses("no",
				"Initialized repository without yaml",
				"Default coverage threshold for the current repository is set to 95%");
		
		// SETTING THE THRESHOLD - LOW
		testCommandOneResponse("@" + botName + " set coverage threshold to 5", 
				"The coverage threshold has been set to 5");
		

		// COVERAGE IS GOOD
		testCommandOneResponse("@" + botName + " test coveralls", 
				"Current coverage is (91%)");

		// SETTING THE THRESHOLD - HIGH
		testCommandOneResponse("@" + botName + " set coverage threshold to 95", 
				"The coverage threshold has been set to 95");

		// COVERAGE IS BAD
		testCommandTwoResponses("@" + botName + " test coveralls", 
				"Current coverage (91%) is below threshold (95%)", 
				"Do you want to create an issue (yes/no)?");
		

		// NOT CREATING THE ISSUE
		testCommandOneResponse("no", 
				"I'll not create the issue");

		// CHANGE ISSUE TITLE
		testCommandOneResponse("@" + botName + " test change issue", 
				"Do you want to create an issue (yes/no)?");
		testCommandOneResponse("yes", 
				"Current issue title is set to BUG.Do you want to change the title of the issue (yes/no)");
		testCommandOneResponse("yes", 
				"Please enter the name of the issue");
		testCommandTwoResponses("issue-name", 
				"I'm creating an issue titled issue-name",
				"Please enter a comma-separated list of assignees to the issue. Ex @user1,@user2,@user3...");

		// ADD ISSUE ASSIGNEES
		testCommandTwoResponses("@user", 
				"I am going to create an issue titled issue-name and assign it to @user",
				"Issue has been created");
	}
}
