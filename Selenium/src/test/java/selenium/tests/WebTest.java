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
	public List<WebElement> waitUntilCountChanges(final String xpath, final int minCount) {
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
		/*
		 * 	BOILERPLATE
		 */
		
		/*
		 *	TESTS
		 */
		
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
		actions.click();
		actions.click();
		actions.sendKeys("@" + botName + " help");
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
		assertEquals("help init or help configure or help issue or help travis or help coveralls", 
				lastBody.getText());
		
		/*
		 *  HELP INIT
		 */

		numMessagesBefore = driver.findElements(By.xpath(xpathSearch)).size();
		Actions actionsInit = new Actions(driver);
		actionsInit.moveToElement(messageBot);
		actionsInit.click();
		actionsInit.click();
		actionsInit.click();
		actionsInit.sendKeys("@" + botName + " help init");
		actionsInit.sendKeys(Keys.RETURN);
		actionsInit.build().perform();
		
		// Execute the actions and wait until the number of messages changes
		messages = waitUntilCountChanges(xpathSearch, numMessagesBefore + 1);
		// Make sure that we have a new messages
		assertTrue("There were no messages", messages.size() > 0);
		assertTrue("No new messages were found", messages.size() == numMessagesBefore + 1);
		
		lastElement = messages.get(messages.size() - 1);
		lastBody = lastElement.findElement(By.xpath(messageBodyRel));
	
		// Make sure that we have the right text
		assertNotNull(lastBody);
		assertEquals("init <repository>", 
				lastBody.getText());
		
		/*
		 *  HELP CONFIGURE
		 */
		numMessagesBefore = driver.findElements(By.xpath(xpathSearch)).size();
		Actions actionsConfigure = new Actions(driver);
		actionsConfigure.moveToElement(messageBot);
		actionsConfigure.click();
		actionsConfigure.click();
		actionsConfigure.click();
		actionsConfigure.sendKeys("@" + botName + " help configure");
		actionsConfigure.sendKeys(Keys.RETURN);
		actionsConfigure.build().perform();
		
		// Execute the actions and wait until the number of messages changes
		messages = waitUntilCountChanges(xpathSearch, numMessagesBefore + 1);
		// Make sure that we have a new messages
		assertTrue("There were no messages", messages.size() > 0);
		assertTrue("No new messages were found", messages.size() == numMessagesBefore + 1);
		
		lastElement = messages.get(messages.size() - 1);
		lastBody = lastElement.findElement(By.xpath(messageBodyRel));
	
		// Make sure that we have the right text
		assertNotNull(lastBody);
		assertEquals("configure <repository>", 
				lastBody.getText());
		
		/*
		 *  HELP ISSUE
		 */

		numMessagesBefore = driver.findElements(By.xpath(xpathSearch)).size();
		Actions actionsIssue = new Actions(driver);
		actionsIssue.moveToElement(messageBot);
		actionsIssue.click();
		actionsIssue.click();
		actionsIssue.click();
		actionsIssue.sendKeys("@" + botName + " help issue");
		actionsIssue.sendKeys(Keys.RETURN);
		actionsIssue.build().perform();
		
		// Execute the actions and wait until the number of messages changes
		messages = waitUntilCountChanges(xpathSearch, numMessagesBefore + 1);
		// Make sure that we have a new messages
		assertTrue("There were no messages", messages.size() > 0);
		assertTrue("No new messages were found", messages.size() == numMessagesBefore + 1);
		
		lastElement = messages.get(messages.size() - 1);
		lastBody = lastElement.findElement(By.xpath(messageBodyRel));
	
		// Make sure that we have the right text
		assertNotNull(lastBody);
		assertEquals("test issue", 
				lastBody.getText());
		
		/*
		 *  HELP TRAVIS
		 */

		numMessagesBefore = driver.findElements(By.xpath(xpathSearch)).size();
		Actions actionsTravis = new Actions(driver);
		actionsTravis.moveToElement(messageBot);
		actionsTravis.click();
		actionsTravis.click();
		actionsTravis.click();
		actionsTravis.sendKeys("@" + botName + " help travis");
		actionsTravis.sendKeys(Keys.RETURN);
		actionsTravis.build().perform();
		
		// Execute the actions and wait until the number of messages changes
		messages = waitUntilCountChanges(xpathSearch, numMessagesBefore + 1);
		// Make sure that we have a new messages
		assertTrue("There were no messages", messages.size() > 0);
		assertTrue("No new messages were found", messages.size() == numMessagesBefore + 1);
		
		lastElement = messages.get(messages.size() - 1);
		lastBody = lastElement.findElement(By.xpath(messageBodyRel));
	
		// Make sure that we have the right text
		assertNotNull(lastBody);
		assertEquals("test travis", 
				lastBody.getText());
		
		/*
		 *  HELP COVERALLS
		 */

		numMessagesBefore = driver.findElements(By.xpath(xpathSearch)).size();
		Actions actionsCoveralls = new Actions(driver);
		actionsCoveralls.moveToElement(messageBot);
		actionsCoveralls.click();
		actionsCoveralls.click();
		actionsCoveralls.click();
		actionsCoveralls.sendKeys("@" + botName + " help coveralls");
		actionsCoveralls.sendKeys(Keys.RETURN);
		actionsCoveralls.build().perform();
		
		// Execute the actions and wait until the number of messages changes
		messages = waitUntilCountChanges(xpathSearch, numMessagesBefore + 1);
		// Make sure that we have a new messages
		assertTrue("There were no messages", messages.size() > 0);
		assertTrue("No new messages were found", messages.size() == numMessagesBefore + 1);
		
		lastElement = messages.get(messages.size() - 1);
		lastBody = lastElement.findElement(By.xpath(messageBodyRel));
	
		// Make sure that we have the right text
		assertNotNull(lastBody);
		assertEquals("test coveralls", 
				lastBody.getText());
	}
	
	/**
	 * 
	 */
//	@Test
//	public void useCase1()
//	{
//		// Type something
//		WebElement messageBot = driver.findElement(By.id("msg_input"));
//		assertNotNull(messageBot);
//		
//		Actions actions = new Actions(driver);
//		actions.moveToElement(messageBot);
//		actions.click();
//		actions.sendKeys("hello world, from Selenium");
//		actions.sendKeys(Keys.RETURN);
//		actions.build().perform();
//
//		wait.withTimeout(3, TimeUnit.SECONDS).ignoring(StaleElementReferenceException.class);
//
//		WebElement msg = driver.findElement(
//				By.xpath("//span[@class='message_body' and text() = 'hello world, from Selenium']"));
//		assertNotNull(msg);
//	}
	
	/**
	 * 
	 */
//	@Test
//	public void useCase2()
//	{
//		// Type something
//		WebElement messageBot = driver.findElement(By.id("msg_input"));
//		assertNotNull(messageBot);
//		
//		Actions actions = new Actions(driver);
//		actions.moveToElement(messageBot);
//		actions.click();
//		actions.sendKeys("hello world, from Selenium");
//		actions.sendKeys(Keys.RETURN);
//		actions.build().perform();
//
//		wait.withTimeout(3, TimeUnit.SECONDS).ignoring(StaleElementReferenceException.class);
//
//		WebElement msg = driver.findElement(
//				By.xpath("//span[@class='message_body' and text() = 'hello world, from Selenium']"));
//		assertNotNull(msg);
//	}
	
	/**
	 * 
	 */
	@Test
	public void useCase3()
	{

		/*
		 * 	BOILERPLATE
		 */
		
		/*
		 *	TESTS
		 */
		
		String xpathSearch = "//div[@class='message_content_header_left']/a[.= '" + botName + "']";
		String messageBodyRel = "../../following-sibling::span[@class='message_body']";
		
		// Type in the help command 
		WebElement messageBot = driver.findElement(By.id("msg_input"));
		assertNotNull(messageBot);
		int numMessagesBefore = driver.findElements(By.xpath(xpathSearch)).size();
		
		/*
		 *  SETTING THE THRESHOLD - LOW
		 */
		
		Actions actionsThreshold = new Actions(driver);
		actionsThreshold.moveToElement(messageBot);
		actionsThreshold.click();
		actionsThreshold.click();
		actionsThreshold.click();
		actionsThreshold.sendKeys("@" + botName + " set coverage threshold to 5");
		actionsThreshold.sendKeys(Keys.RETURN);
		actionsThreshold.build().perform();

		// Execute the actions and wait until the number of messages changes
		List<WebElement> messages = waitUntilCountChanges(xpathSearch, numMessagesBefore + 1);
		// Make sure that we have a new messages
		assertTrue("There were no messages", messages.size() > 0);
		assertTrue("No new messages were found", messages.size() == numMessagesBefore + 1);
		
		WebElement lastElement = messages.get(messages.size() - 1);
		WebElement lastBody = lastElement.findElement(By.xpath(messageBodyRel));
	
		// Make sure that we have the right text
		assertNotNull(lastBody);
		assertEquals("The coverage threshold has been set to 5", 
				lastBody.getText());
		
		/*
		 *  COVERAGE IS GOOD
		 */

		numMessagesBefore = driver.findElements(By.xpath(xpathSearch)).size();
		Actions actionsCoverageGood = new Actions(driver);
		actionsCoverageGood.moveToElement(messageBot);
		actionsCoverageGood.click();
		actionsCoverageGood.click();
		actionsCoverageGood.click();
		actionsCoverageGood.sendKeys("@" + botName + " test coveralls");
		actionsCoverageGood.sendKeys(Keys.RETURN);
		actionsCoverageGood.build().perform();
		
		// Execute the actions and wait until the number of messages changes
		messages = waitUntilCountChanges(xpathSearch, numMessagesBefore + 1);
		// Make sure that we have a new messages
		assertTrue("There were no messages", messages.size() > 0);
		assertTrue("No new messages were found", messages.size() == numMessagesBefore + 1);
		
		lastElement = messages.get(messages.size() - 1);
		lastBody = lastElement.findElement(By.xpath(messageBodyRel));
	
		// Make sure that we have the right text
		assertNotNull(lastBody);
		assertEquals("Current coverage is (91%)", 
				lastBody.getText());
		
		/*
		 *  SETTING THE THRESHOLD - HIGH
		 */

		numMessagesBefore = driver.findElements(By.xpath(xpathSearch)).size();
		Actions actionsThresholdHigh = new Actions(driver);
		actionsThresholdHigh.moveToElement(messageBot);
		actionsThresholdHigh.click();
		actionsThresholdHigh.click();
		actionsThresholdHigh.click();
		actionsThresholdHigh.sendKeys("@" + botName + " set coverage threshold to 95");
		actionsThresholdHigh.sendKeys(Keys.RETURN);
		actionsThresholdHigh.build().perform();
		
		// Execute the actions and wait until the number of messages changes
		messages = waitUntilCountChanges(xpathSearch, numMessagesBefore + 1);
		// Make sure that we have a new messages
		assertTrue("There were no messages", messages.size() > 0);
		assertTrue("No new messages were found", messages.size() == numMessagesBefore + 1);
		
		lastElement = messages.get(messages.size() - 1);
		lastBody = lastElement.findElement(By.xpath(messageBodyRel));
	
		// Make sure that we have the right text
		assertNotNull(lastBody);
		assertEquals("The coverage threshold has been set to 95", 
				lastBody.getText());
		
//		/*
//		 *  COVERAGE IS BAD
//		 */
//
//		numMessagesBefore = driver.findElements(By.xpath(xpathSearch)).size();
//		Actions actionsCoverageBad = new Actions(driver);
//		actionsCoverageBad.moveToElement(messageBot);
//		actionsCoverageBad.click();
//		actionsCoverageBad.click();
//		actionsCoverageBad.click();
//		actionsCoverageBad.sendKeys("@" + botName + " test coveralls");
//		actionsCoverageBad.sendKeys(Keys.RETURN);
//		actionsCoverageBad.build().perform();
//		
//		// Execute the actions and wait until the number of messages changes
//		messages = waitUntilCountChanges(xpathSearch, numMessagesBefore + 2);
//		// Make sure that we have a new messages
//		assertTrue("There were no messages", messages.size() > 0);
//		assertTrue("No new messages were found", messages.size() == numMessagesBefore + 2);
//
//		WebElement secondLastElement = messages.get(messages.size() -2);
//		WebElement secondLastBody = secondLastElement.findElement(By.xpath(messageBodyRel));
//		lastElement = messages.get(messages.size() - 1);
//		lastBody = lastElement.findElement(By.xpath(messageBodyRel));
//	
//		// Make sure that we have the right text
//		assertNotNull(secondLastBody);
//		assertEquals("Current coverage (91%) is below threshold (95%)", 
//				secondLastBody.getText());
//		assertNotNull(lastBody);
//		assertEquals("Current issue title is set to Coverage 4 percent below threshold."
//				+ "Do you want to change the title of the issue (yes/no)?", 
//				lastBody.getText());
//		
//		/*
//		 * 	NOT CREATING THE ISSUE
//		 */
//		
//		// TODO
//		
//		/*
//		 *  CHANGE ISSUE TITLE
//		 */
//
////		numMessagesBefore = driver.findElements(By.xpath(xpathSearch)).size();
////		Actions actionsCoveralls = new Actions(driver);
////		actionsCoveralls.moveToElement(messageBot);
////		actionsCoveralls.click();
////		actionsCoveralls.click();
////		actionsCoveralls.click();
////		actionsCoveralls.sendKeys("yes");
////		actionsCoveralls.sendKeys(Keys.RETURN);
////		actionsCoveralls.build().perform();
////		
////		// Execute the actions and wait until the number of messages changes
////		messages = waitUntilCountChanges(xpathSearch, numMessagesBefore + 1);
////		// Make sure that we have a new messages
////		assertTrue("There were no messages", messages.size() > 0);
////		assertTrue("No new messages were found", messages.size() == numMessagesBefore + 1);
////		
////		lastElement = messages.get(messages.size() - 1);
////		lastBody = lastElement.findElement(By.xpath(messageBodyRel));
////	
////		// Make sure that we have the right text
////		assertNotNull(lastBody);
////		assertEquals("", 
////				lastBody.getText());
//		
//		/*
//		 *  ADD ISSUE ASSIGNEES
//		 */
//
//		numMessagesBefore = driver.findElements(By.xpath(xpathSearch)).size();
//		Actions actionsAddAssignees = new Actions(driver);
//		actionsAddAssignees.moveToElement(messageBot);
//		actionsAddAssignees.click();
//		actionsAddAssignees.click();
//		actionsAddAssignees.click();
//		actionsAddAssignees.sendKeys("@arewm");
//		actionsAddAssignees.sendKeys(Keys.RETURN);
//		actionsAddAssignees.build().perform();
//		
//		// Execute the actions and wait until the number of messages changes
//		messages = waitUntilCountChanges(xpathSearch, numMessagesBefore + 1);
//		// Make sure that we have a new messages
//		assertTrue("There were no messages", messages.size() > 0);
//		assertTrue("No new messages were found", messages.size() == numMessagesBefore + 1);
//		
//		lastElement = messages.get(messages.size() - 1);
//		lastBody = lastElement.findElement(By.xpath(messageBodyRel));
//	
//		// Make sure that we have the right text
//		assertNotNull(lastBody);
//		assertEquals("I am going to create an issue titled Coverage 4 percent below threshold and assign it to arewm", 
//				lastBody.getText());
//		
//		/*
//		 *  NOT ADD ISSUE ASSIGNEES
//		 */
//
////		numMessagesBefore = driver.findElements(By.xpath(xpathSearch)).size();
////		Actions actionsNotAddAssignees = new Actions(driver);
////		actionsNotAddAssignees.moveToElement(messageBot);
////		actionsNotAddAssignees.click();
////		actionsNotAddAssignees.click();
////		actionsNotAddAssignees.click();
////		actionsNotAddAssignees.sendKeys("yes");
////		actionsNotAddAssignees.sendKeys(Keys.RETURN);
////		actionsNotAddAssignees.build().perform();
////		
////		// Execute the actions and wait until the number of messages changes
////		messages = waitUntilCountChanges(xpathSearch, numMessagesBefore + 1);
////		// Make sure that we have a new messages
////		assertTrue("There were no messages", messages.size() > 0);
////		assertTrue("No new messages were found", messages.size() == numMessagesBefore + 1);
////		
////		lastElement = messages.get(messages.size() - 1);
////		lastBody = lastElement.findElement(By.xpath(messageBodyRel));
////	
////		// Make sure that we have the right text
////		assertNotNull(lastBody);
////		assertEquals("", 
////				lastBody.getText());
	}

}
