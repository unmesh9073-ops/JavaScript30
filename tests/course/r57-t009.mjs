import { chromium } from 'playwright';
import { spawn } from 'child_process';
import assert from 'assert';

(async () => {
    const server = spawn('npx', ['http-server', '.', '-p', '8080'], { detached: true });
    await new Promise(resolve => setTimeout(resolve, 2000));

    const browser = await chromium.launch();

    // Launch context with reduced-motion emulated
    const context = await browser.newContext({
        colorScheme: 'light',
        reducedMotion: 'reduce'
    });
    const page = await context.newPage();

    try {
        await page.goto('http://localhost:8080/23%20-%20Speech%20Synthesis/index-START.html');

        // Test 1: Verify keyboard focus visibility
        const firstButton = page.locator('button').first();
        await firstButton.focus();

        // Evaluate the computed outline style applied by our CSS
        const outlineStyle = await firstButton.evaluate((el) => {
            return window.getComputedStyle(el).outlineStyle;
        });
        assert.notStrictEqual(outlineStyle, 'none', 'Focused controls must have a visible outline style for accessibility');

        // Test 2: Verify reduced motion disables CSS transitions
        const transitionDuration = await firstButton.evaluate((el) => {
            return window.getComputedStyle(el).transitionDuration;
        });
        assert.strictEqual(transitionDuration, '0s', 'Transitions must be disabled (0s) when prefers-reduced-motion is active');

        console.log('Success: All R57-T009 Accessibility (Motion/Focus) assertions passed.');
        process.exit(0);
    } catch (error) {
        console.error('Assertion failure:', error);
        process.exit(1);
    } finally {
        await browser.close();
        process.kill(-server.pid);
    }
})();