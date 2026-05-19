const { Builder, By, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const { expect } = require('chai');
const fs = require('fs'); 

(async function executarTestesNielsen() {
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
    console.log('--- INICIANDO BATERIA DE TESTES (HEURÍSTICAS DE NIELSEN) ---');
    console.log('Abrindo site: Wikipedia (pt.wikipedia.org)...');
    await driver.get('https://pt.wikipedia.org/');
    
    const tirarScreenshot = async (nomeArquivo) => {
      const image = await driver.takeScreenshot();
      fs.writeFileSync(nomeArquivo, image, 'base64');
      console.log(`Screenshot salvo: ${nomeArquivo}`);
    };

    // TESTE 1: Heurística 4 - Consistência e Padronização
    console.log('\n[Teste 1] Avaliando: Consistência e Padronização...');
    // Padrão Web: O logotipo principal deve sempre possuir um link para a Home
    const logo = await driver.findElement(By.css('.mw-logo'));
    const logoHref = await logo.getAttribute('href');
    expect(logoHref).to.include('P%C3%A1gina_principal');
    await tirarScreenshot('log_1_padronizacao.png');
    console.log('OK: A logo do site é um link consistente para a página inicial.');

    // TESTE 2: Heurística 10 - Ajuda e Documentação
    console.log('\n[Teste 2] Avaliando: Ajuda e Documentação...');
    // O sistema deve oferecer documentação acessível. Como a Wikipedia esconde
    // o menu lateral na nova interface, vamos verificar o link de 
    // documentação "Sobre a Wikipédia" que fica fixo no rodapé.
    const linkDoc = await driver.findElement(By.css('#footer-places-about a'));
    
    // Rola a página até o rodapé para garantir a renderização
    await driver.executeScript("arguments[0].scrollIntoView(true);", linkDoc);
    await driver.sleep(500); // Pausa rápida para a rolagem acontecer

    const docVisivel = await linkDoc.isDisplayed();
    expect(docVisivel).to.be.true;
    await tirarScreenshot('log_2_ajuda.png');
    console.log(' OK: Link de documentação "Sobre a Wikipédia" está visível no rodapé.');

    // TESTE 3: Heurística 1 - Visibilidade do Status do Sistema
    console.log('\n[Teste 3] Avaliando: Visibilidade do Status do Sistema...');
    // Ao realizar uma busca, o sistema deve mostrar claramente onde o usuário está (Título da página)
    const campoBusca = await driver.findElement(By.css('input[type="search"]'));
    await campoBusca.sendKeys('JavaScript\n'); 
    
    // Espera a página carregar a resposta
    await driver.wait(until.elementLocated(By.id('firstHeading')), 5000);
    const tituloBusca = await driver.findElement(By.id('firstHeading')).getText();
    expect(tituloBusca).to.include('JavaScript');
    await tirarScreenshot('log_3_status_sistema.png');
    console.log('OK: Sistema informa o status carregando a página com o título correto.');

    console.log('\n TODOS OS TESTES PASSARAM COM SUCESSO!');

  } catch (erro) {
    console.error('Erro durante a execução dos testes:', erro);
    // Tenta tirar uma screenshot do momento do erro
    const imageError = await driver.takeScreenshot();
    fs.writeFileSync('log_erro.png', imageError, 'base64');
  } finally {
    await driver.quit();
    console.log('Navegador encerrado.');
  }
})();