const { Builder, By, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const { expect } = require('chai');

(async function executarTesteFatec() {
  const options = new chrome.Options();
  
  options.addArguments('--headless=new'); 
  options.addArguments('--no-sandbox');
  options.addArguments('--disable-dev-shm-usage');
  options.addArguments('--disable-gpu');
  options.addArguments('--window-size=1920,1080');

  let driver = await new Builder()
    .forBrowser('chrome')
    .setChromeOptions(options)
    .build();

  try {
    console.log('Abrindo site...');
    await driver.get('https://cps.sp.gov.br/');

    const titulo = await driver.getTitle();
    console.log('Título:', titulo);
    expect(titulo).to.include('Centro Paula Souza');

    const menu = await driver.findElement(By.css('nav'));
    const visivel = await menu.isDisplayed();
    console.log('Menu visível?', visivel);
    expect(visivel).to.be.true;

    // Aguarda o campo de busca estar visível e interativo
    const campoBusca = await driver.wait(
      until.elementLocated(By.css('input[type="search"], input[name="s"]')), 
      5000
    );
    await campoBusca.sendKeys('cursos\n');
    
    await driver.wait(until.urlContains('cursos'), 5000);
    console.log('Redirecionamento OK');

    console.log('✅ Teste concluído com sucesso!');
  } catch (erro) {
    console.error('❌ Ocorreu um erro durante o teste:', erro);
  } finally {
    await driver.quit();
    console.log('🛑 Navegador encerrado.');
  }
})();