import { chromium } from 'playwright';
import { spawn } from 'child_process';
import assert from 'assert';

(async () => {
    // Start the local server in detached mode
    const server = spawn('npx', ['http-server', '.', '-p', '8080'], { detached: true });
    await new Promise(resolve => setTimeout(resolve, 2000)); // Wait for server readiness

    const browser = await chromium.launch();
    const context = await browser.newContext();
    const page = await context.newPage();

    try {
        await page.goto('http://localhost:8080/30%20-%20Whack%20A%20Mole/index-START.html');

        // Test 1: Visible focus traversal
        const firstMole = page.locator('.mole').first();
        await firstMole.focus();

        const outlineStyle = await page.evaluate(() => {
            const mole = document.querySelector('.mole:focus');
            return mole ? window.getComputedStyle(mole).outlineStyle : 'none';
        });

        // Strict assertion for layout
        assert.notStrictEqual(outlineStyle, 'none', 'Focus outline should be visible on moles');

        // Test 2: Keyboard Activation
        await page.keyboard.press('Enter');
        const score = await page.locator('.score').textContent();

        // Strict assertion for event effects
        assert.strictEqual(score, '1', 'Score should increment to 1 after keyboard activation (Enter)');

        console.log('Success: All R57-T001 assertions passed.');
        process.exit(0);
    } catch (error) {
        console.error('Assertion failure:', error);
        process.exit(1);
    } finally {
        // Clean up server and browser processes
        await browser.close();
        process.kill(-server.pid);
    }
})();