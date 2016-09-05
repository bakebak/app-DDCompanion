function ViewModel() {
    var self = this;
    var firstTemplateData = {
        text: 'First template',
        label: ko.observable('Observable label')
    };

    self.modalVisible = ko.observable(false);
    self.modalSize = ko.observable('modal-lg');
    self.headerLabel = ko.observable('Logar com usuário');
    self.bodyTemplate = ko.observable('firstModalTemplate');
    self.bodyData = ko.observable(firstTemplateData);

    self.show = function () {
        self.modalVisible(true);
    };

    self.okText = ko.observable();

    self.switchTemplates = function () {
        console.log("ALo");
    };

}