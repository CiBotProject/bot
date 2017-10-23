package selenium.tests;

import static org.junit.Assert.*;

import java.util.List;
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
	 * 
	 */
	@Test
	public void helpMessage()
	{
		/**
		 * <b data-stringify-prefix="*" data-stringify-suffix="*" data-stringify-requires-siblings=""><i data-stringify-prefix="_" data-stringify-suffix="_" data-stringify-requires-siblings="">help init</i></b> or <b data-stringify-prefix="*" data-stringify-suffix="*" data-stringify-requires-siblings=""><i data-stringify-prefix="_" data-stringify-suffix="_" data-stringify-requires-siblings="">help configure</i></b> or <b data-stringify-prefix="*" data-stringify-suffix="*" data-stringify-requires-siblings=""><i data-stringify-prefix="_" data-stringify-suffix="_" data-stringify-requires-siblings="">help issue</i></b> or <b data-stringify-prefix="*" data-stringify-suffix="*" data-stringify-requires-siblings=""><i data-stringify-prefix="_" data-stringify-suffix="_" data-stringify-requires-siblings="">help travis</i></b> or <b data-stringify-prefix="*" data-stringify-suffix="*" data-stringify-requires-siblings=""><i data-stringify-prefix="_" data-stringify-suffix="_" data-stringify-requires-siblings="">help coveralls</i></b><span class="constrain_triple_clicks"></span>
		 */
//		String text = "";
//		String text = "*help init* or *help configure* or *help issue* or *help travis* or *help coveralls*";
//		String text = "<b data-stringify-prefix=\"*\" data-stringify-suffix=\"*\" data-stringify-requires-siblings=\"\"><i data-stringify-prefix=\"_\" data-stringify-suffix=\"_\" data-stringify-requires-siblings=\"\">help init</i></b> or <b data-stringify-prefix=\"*\" data-stringify-suffix=\"*\" data-stringify-requires-siblings=\"\"><i data-stringify-prefix=\"_\" data-stringify-suffix=\"_\" data-stringify-requires-siblings=\"\">help configure</i></b> or <b data-stringify-prefix=\"*\" data-stringify-suffix=\"*\" data-stringify-requires-siblings=\"\"><i data-stringify-prefix=\"_\" data-stringify-suffix=\"_\" data-stringify-requires-siblings=\"\">help issue</i></b> or <b data-stringify-prefix=\"*\" data-stringify-suffix=\"*\" data-stringify-requires-siblings=\"\"><i data-stringify-prefix=\"_\" data-stringify-suffix=\"_\" data-stringify-requires-siblings=\"\">help travis</i></b> or <b data-stringify-prefix=\"*\" data-stringify-suffix=\"*\" data-stringify-requires-siblings=\"\"><i data-stringify-prefix=\"_\" data-stringify-suffix=\"_\" data-stringify-requires-siblings=\"\">help coveralls</i></b><span class=\"constrain_triple_clicks\">";
//		String xpathSearch = "//span[@class='message_body']";
		String xpathSearch = "//div[@class='message_content_header_left']/a[.= '" + botName + "']";
		// Type something
		WebElement messageBot = driver.findElement(By.id("msg_input"));
		assertNotNull(messageBot);
		int numMessagesBefore = driver.findElements(By.xpath(xpathSearch)).size();
		
		Actions actions = new Actions(driver);
		actions.moveToElement(messageBot);
		actions.click();
		actions.sendKeys("@" + botName + " help");
		actions.sendKeys(Keys.RETURN);
		actions.build().perform();

		wait.withTimeout(10, TimeUnit.SECONDS).ignoring(StaleElementReferenceException.class);

		int numMessagesAfter = driver.findElements(By.xpath(xpathSearch)).size();
		System.out.println(xpathSearch);
		System.out.println(numMessagesBefore);
		System.out.println(numMessagesAfter);
		assertTrue("There were no messages", numMessagesAfter > 0);
		assertTrue("No new messages were found", numMessagesAfter > numMessagesBefore);
	}
	
	/**
	 * 
	 */
	@Test
	public void useCase1()
	{
		// Type something
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
	}
	
	/**
	 * 
	 */
	@Test
	public void useCase2()
	{
		// Type something
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
	}
	
	/**
	 * 
	 */
	@Test
	public void useCase3()
	{
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
	}

}
