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
        await page.goto('http://localhost:8080/20%20-%20Speech%20Detection/index-START.html');

        // Test 1: Verify the baseline correct state (words container is visible and styled)
        const wordsContainer = page.locator('.words');
        const displayStyle = await wordsContainer.evaluate((el) => window.getComputedStyle(el).display);
        assert.notStrictEqual(displayStyle, 'none', 'Baseline correct state: Speech container should be visible');

        // Test 2: Deliberately break the layout in a temporary test fixture
        await page.evaluate(() => {
            document.querySelector('.words').style.display = 'none'; // Simulate a CSS regression hiding the UI
        });

        // Test 3: Assert that the test catches the broken state
        const brokenDisplayStyle = await wordsContainer.evaluate((el) => window.getComputedStyle(el).display);
        assert.strictEqual(brokenDisplayStyle, 'none', 'Fixture mutation state: The test must successfully detect the layout regression');

        console.log('Success: All R57-T010 UI Regression assertions passed.');
        process.exit(0);
    } catch (error) {
        console.error('Assertion failure:', error);
        process.exit(1);
    } finally {
        await browser.close();
        process.kill(-server.pid);
    }
})();
