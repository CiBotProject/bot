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
	
	public void waitUntilCountChanges(final String xpath, final int lastCount) {
        WebDriverWait wait = new WebDriverWait(driver, 5);
//		actions.build().perform();
        wait.until(new ExpectedCondition<Boolean>() {
            public Boolean apply(WebDriver driver) {
                int elementCount = driver.findElements(By.xpath(xpath)).size();
                if (elementCount > lastCount)
                    return true;
                else
                    return false;
            }
        });
    }
	
	/**
	 * 
	 */
	@Test
	public void helpMessage()
	{
		String xpathSearch = "//div[@class='message_content_header_left']/a[.= '" + botName + "']";
		String messageBodyRel = "../../following-sibling::span[@class='message_body']";
		
		// Type in the help command 
		WebElement messageBot = driver.findElement(By.id("msg_input"));
		assertNotNull(messageBot);
		int numMessagesBefore = driver.findElements(By.xpath(xpathSearch)).size();
		
		Actions actions = new Actions(driver);
		actions.moveToElement(messageBot);
		actions.click();
		actions.contextClick();
		actions.sendKeys("@" + botName + " help");
		actions.sendKeys(Keys.RETURN);
		actions.build().perform();

		// Execute the actions and wait until the number of messages changes
		waitUntilCountChanges(xpathSearch, numMessagesBefore);

		List<WebElement> messages = driver.findElements(By.xpath(xpathSearch));
		WebElement lastElement = messages.get(messages.size() - 1);
		WebElement lastBody = lastElement.findElement(By.xpath(messageBodyRel));

		// Make sure that we have a new messages
		assertTrue("There were no messages", messages.size() > 0);
		assertTrue("No new messages were found", messages.size() == numMessagesBefore + 1);
	
		// Make sure that we have the right text
		assertNotNull(lastBody);
		assertEquals("help init or help configure or help issue or help travis or help coveralls", 
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
//	@Test
//	public void useCase3()
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

}
