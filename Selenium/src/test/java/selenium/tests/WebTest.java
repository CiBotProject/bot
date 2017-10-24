package selenium.tests;

import static org.junit.Assert.*;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.concurrent.TimeUnit;

import org.junit.AfterClass;
import org.junit.Before;
import org.junit.BeforeClass;
import org.junit.Test;
import org.openqa.selenium.By;
import org.openqa.selenium.Keys;
import org.openqa.selenium.StaleElementReferenceException;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.htmlunit.HtmlUnitDriver;
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
//	private static int numResponses = 0;
	
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
	}
	
	@AfterClass
	public static void  tearDown() throws Exception
	{
		driver.close();
		driver.quit();
	}
	
	/**
	 * Helper function to make sure that we have all of the messages we want to check
	 * 
	 * @param xpath
	 * @param minCount
	 * @return
	 */
	private List<WebElement> waitUntilCountChanges(final String xpath, final int minCount)
	{
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
	 * Helper function to test a command with one expected response
	 * 
	 * @param command
	 * @param expectedResponse
	 */
	private void testCommandOneResponse(String command, String expectedResponse)
	{
		String xpathSearch = "//div[@class='message_content_header_left']/a[.= '" + botName + "']";
		String messageBodyRel = "../../following-sibling::span[@class='message_body']";
		// Type in the help command 
		WebElement messageBot = driver.findElement(By.id("msg_input"));
		assertNotNull(messageBot);
		int numMessagesBefore = driver.findElements(By.xpath(xpathSearch)).size();
		
		/*
		 * DEFAULT HELP
		 */
		
		Actions actions = new Actions(driver);
		actions.moveToElement(messageBot);
		actions.click();
		actions.click();		// not sure if this does anything, but keystrokes were not registering
		actions.click();
		actions.sendKeys(command);
		actions.sendKeys(Keys.RETURN);
		actions.build().perform();

		// Execute the actions and wait until the number of messages changes
		List<WebElement> messages = waitUntilCountChanges(xpathSearch, numMessagesBefore + 1);
		// Make sure that we have a new messages
		assertTrue("There were no messages", messages.size() > 0);
		assertTrue("No new messages were found", messages.size() == numMessagesBefore + 1);
		
		WebElement lastElement = messages.get(messages.size() - 1);
		WebElement lastBody = lastElement.findElement(By.xpath(messageBodyRel));
	
		// Make sure that we have the right text
		assertNotNull(lastBody);
		assertEquals(expectedResponse, lastBody.getText());
	}
	
	/**
	 * Helper function to test a command with two expected responses
	 * 
	 * @param command
	 * @param expectedResponse1
	 * @param expectedResponse2
	 */
	private void testCommandTwoResponses(String command, String expectedResponse1, String expectedResponse2)
	{
		String xpathSearch = "//div[@class='message_content_header_left']/a[.= '" + botName + "']";
		String messageBodyRel = "../../following-sibling::span[@class='message_body']";
		// Type in the help command 
		WebElement messageBot = driver.findElement(By.id("msg_input"));
		assertNotNull(messageBot);
		int numMessagesBefore = driver.findElements(By.xpath(xpathSearch)).size();
		
		/*
		 * DEFAULT HELP
		 */
		
		Actions actions = new Actions(driver);
		actions.moveToElement(messageBot);
		actions.click();
		actions.click();		// not sure if this does anything, but keystrokes were not registering
		actions.click();
		actions.sendKeys(command);
		actions.sendKeys(Keys.RETURN);
		actions.build().perform();

		// Execute the actions and wait until the number of messages changes
		List<WebElement> messages = waitUntilCountChanges(xpathSearch, numMessagesBefore + 2);
		// Make sure that we have a new messages
		assertTrue("There were no messages", messages.size() > 0);
		assertTrue("No new messages were found", messages.size() == numMessagesBefore + 2);

		WebElement secondLastElement = messages.get(messages.size() -2);
		WebElement secondLastBody = secondLastElement.findElement(By.xpath(messageBodyRel));
		WebElement lastElement = messages.get(messages.size() - 1);
		WebElement lastBody = lastElement.findElement(By.xpath(messageBodyRel));
	
		// Make sure that we have the right text
		assertNotNull(secondLastBody);
		assertEquals(expectedResponse1, secondLastBody.getText());
		assertNotNull(lastBody);
		assertEquals(expectedResponse2, lastBody.getText());
	}
	
	/**
	 * 
	 */
	@Test
	public void helpMessage()
	{
		// GENERAL HELP
		testCommandOneResponse("@" + botName + " help", 
				"help init or help configure or help issue or help travis or help coveralls");
		
		// USE CASE 1 HELP
		testCommandOneResponse("@" + botName + " help init", "init <repository>");
		testCommandOneResponse("@" + botName + " help configure", "configure <repository>");
		
		testCommandOneResponse("@" + botName + " help issue", "test issue");
		
		// USE CASE 2 HELP
		testCommandOneResponse("@" + botName + " help travis", "test travis");
		
		// USE CASE 3 HELP
		testCommandOneResponse("@" + botName + " help coveralls", "test coveralls");
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
//	@Test
//	public void useCase2()
//	{
//		
//	}
	
	/**
	 * 
	 */
	@Test
	public void useCase3()
	{
		// SETTING THE THRESHOLD - LOW
		testCommandOneResponse("@" + botName + " set coverage threshold to 5", 
				"The coverage threshold has been set to 5");
		
		// COVERAGE IS GOOD
//		testCommandOneResponse("@" + botName + " test coveralls", "Current coverage is (91%)");
		
		// SETTING THE THRESHOLD - HIGH
		testCommandOneResponse("@" + botName + " set coverage threshold to 95", 
				"The coverage threshold has been set to 95");
		
		// COVERAGE IS BAD
//		testCommandTwoResponses("@" + botName + " test coveralls", 
//				"Current coverage (91%) is below threshold (95%)", 
//				"Current issue title is set to Coverage 4 percent below threshold."
//				+ "Do you want to change the title of the issue (yes/no)?");
		
		// NOT CREATING THE ISSUE
//		testCommandTwoResponses("@" + botName + " test coveralls", 
//				"Current coverage (91%) is below threshold (95%)", 
//				"Current issue title is set to Coverage 4 percent below threshold."
//				+ "Do you want to change the title of the issue (yes/no)?");
//		testCommandOneResponse("no", "");
		
		// CHANGE ISSUE TITLE
//		testCommandTwoResponses("@" + botName + " test coveralls", 
//				"Current coverage (91%) is below threshold (95%)", 
//				"Current issue title is set to Coverage 4 percent below threshold."
//				+ "Do you want to change the title of the issue (yes/no)?");
//		testCommandOneResponse("yes", "");
		
		// ADD ISSUE ASSIGNEES
//		testCommandOneResponse("@arewm", 
//				"I am going to create an issue titled Coverage 4 percent below threshold and assign it to arewm");
		
		// NOT ADD ISSUE ASSIGNEES
//		testCommandTwoResponses("@" + botName + " test coveralls", 
//				"Current coverage (91%) is below threshold (95%)", 
//				"Current issue title is set to Coverage 4 percent below threshold."
//				+ "Do you want to change the title of the issue (yes/no)?");
//		testCommandOneResponse("no", 
//				"Please enter a comma-separated list of assignees to the issue. Ex @user1,@user2,@user3...");
//		testCommandOneResponse("", "");
	}
}
