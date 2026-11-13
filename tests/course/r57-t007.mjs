import { chromium } from 'playwright';
import { spawn } from 'child_process';
import assert from 'assert';

(async () => {
    const server = spawn('npx', ['http-server', '.', '-p', '8080'], { detached: true });
    await new Promise(resolve => setTimeout(resolve, 2000));

    const browser = await chromium.launch();
    const context = await browser.newContext();
    const page = await context.newPage();

    try {
        await page.goto('http://localhost:8080/29%20-%20Countdown%20Timer/index.html');

        // Wait for the timer buttons to be ready and click the first preset button
        const firstButton = page.locator('.timer__button').first();
        await firstButton.waitFor();
        await firstButton.click();

        // Allow a brief moment for the timer interval to populate the DOM
        await page.waitForTimeout(300);

        // Verify timer display updates with remaining time
        const timeLeft = await page.locator('.display__time-left').textContent();
        assert.notStrictEqual(timeLeft, '', 'Timer display should show remaining time after clicking a preset');

        console.log('Success: All R57-T007 Countdown Timer assertions passed.');
        process.exit(0);
    } catch (error) {
        console.error('Assertion failure:', error);
        process.exit(1);
    } finally {
        await browser.close();
        process.kill(-server.pid);
    }
})();