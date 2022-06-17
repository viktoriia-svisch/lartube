import { Selector } from 'testcafe'; 
fixture `Getting Started`
    .page `127.0.0.1:8000/#/`;  
test('Search', async t => {
    await t
        .typeText('#theLiveSearch', 'local')
        .click('.d-block')
        .expect(Selector('#app').textContent).contains('LOCAL').expect(Selector('#theLiveSearch').textContent).eql('');
});
test('Tags', async t => {
    await t
        .click('.vs-navbar > .vs-component')
        .click(Selector('.material-icons').withText('tag'))
        .click('.vs-sidebar--background')
        .click(Selector('.btn-primary').withText('35C3'))
        .expect(Selector('.sgfText').withText('ChaosWest').textContent).contains('ChaosWest');
});
test('Login and logout', async t => {
    await t
        .click('.vs-navbar > .vs-component')
        .click(Selector('.material-icons').withText('exit_to_app'))
        .click('.vs-sidebar--background')
        .typeText('#email', 'bla@bla.bla')
        .typeText('#password', 'blabla')
        .click('.col-md-8 > .btn-primary')
        .click('.vs-navbar > .vs-component')
        .expect(Selector('.header-sidebar').textContent).contains('bla')
        .click(Selector('.material-icons').withText('power_settings_new'))
        .expect(Selector('.header-sidebar').textContent).notContains('bla')
        ;
});
test('Go to types', async t => {
    await t
        .click('.vs-navbar > .vs-component')
        .click('.vue-treeselect__control')
        .expect(Selector('.vue-treeselect').textContent).contains('Audio','Video');
});
