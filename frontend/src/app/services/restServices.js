angular.module('restServices', [])
/** @ngInject */
.factory('Printer', ($resource, ENV) => {
  const printers = $resource(`${ENV.api}/printer`);
  const printerIdStatus = $resource(`${ENV.api}/printer/status/:printerId`, {printerId: '@id'});
  const printerStatus = $resource(`${ENV.api}/printer/status`);
  const printerSettings = $resource(`${ENV.api}/printer/settings`);

  function getCheckedPrinterId(printers) {
    const id = [];
    printers.forEach(printer => {
      if (printer.checked) {
        id.push(printer.id);
      }
    });

    return id;
  }

  function getCheckedPrinter(printers) {
    const checked = [];
    printers.forEach(printer => {
      if (printer.checked) {
        checked.push(printer);
      }
    });

    return checked;
  }

  function operational(printers) {
    let result = true;

    printers.forEach(printer => {
      if (printer.checked && printer.state.state !== "Operational") {
        result = false;
      }
    });

    return result;
  }

  return {
    getPrinters: () => {
      return printers.query().$promise;
    },
    addPrinter: printer => {
      return printers.save(printer).$promise;
    },
    removePrinters: printerArray => {
      return printers.remove({printerId: getCheckedPrinterId(printerArray)}).$promise;
    },
    getPrinterIdStatus: printerId => {
      return printerIdStatus.get({printerId}).$promise;
    },
    getPrinterStatus: () => {
      return printerStatus.query().$promise;
    },
    setToolTemperature: (printerArray, temperature) => {
      return printerStatus.save({printerId: getCheckedPrinterId(printerArray)}, {tool: temperature}).$promise;
    },
    pause: printerArray => {
      return printerStatus.save({printerId: getCheckedPrinterId(printerArray)}, {pause: true}).$promise;
    },
    pausePrinter: printerId => {
      return printerStatus.save({printerId}, {pause: true}).$promise;
    },
    cancel: printerArray => {
      return printerStatus.save({printerId: getCheckedPrinterId(printerArray)}, {cancel: true}).$promise;
    },
    cancelPrinter: printerId => {
      return printerStatus.save({printerId}, {cancel: true}).$promise;
    },
    setBedTemperature: (printerArray, temperature) => {
      return printerStatus.save({printerId: getCheckedPrinterId(printerArray)}, {bed: temperature}).$promise;
    },
    saveSettings: (printerArray, settings) => {
      return printerSettings.save({printerId: getCheckedPrinterId(printerArray)}, settings).$promise;
    },
    getSettings: printerArray => {
      return printerSettings.query({printerId: getCheckedPrinterId(printerArray)}).$promise;
    },
    getCheckedPrinterId,
    operational,
    getCheckedPrinter
  };
})
/** @ngInject */
.factory('Files', ($resource, ENV, Printer) => {
  const uploads = $resource(`${ENV.api}/printer/upload`, {printerId: '@id'}, {
    upload: {
      method: 'POST',
      headers: {'Content-Type': undefined}
    }
  });
  const files = $resource(`${ENV.api}/printer/:printerId/files`, {printerId: '@printerId'});

  return {
    uploadFile: (file, printerArray) => {
      const data = new FormData();
      data.append('file', file);

      return uploads.upload({printerId: Printer.getCheckedPrinterId(printerArray)}, data).$promise;
    },
    uploadPrintFile: (file, printerArray) => {
      const data = new FormData();
      data.append('file', file);

      return uploads.upload({printerId: Printer.getCheckedPrinterId(printerArray), print: true}, data).$promise;
    },
    getFiles: printerId => {
      return files.query({printerId}).$promise;
    },
    deleteFile: (printerId, file) => {
      return files.remove({printerId, origin: file.origin, name: file.name}).$promise;
    },
    printFile: (printerId, file) => {
      return files.save({printerId}, {origin: file.origin, name: file.name}).$promise;
    }
  };
})

/** @ngInject */
.factory('Group', ($resource, ENV) => {
  const groups = $resource(`${ENV.api}/group`);
  const groupSettings = $resource(`${ENV.api}/group/settings/:groupId`, {groupId: '@id'},
    {
      put: {method: 'PUT'}
    });

  return {
    getGroups: () => {
      return groups.query().$promise;
    },
    addGroup: group => {
      return groups.save(group).$promise;
    },
    getGroupSettings: groupId => {
      return groupSettings.get({groupId}).$promise;
    },
    setGroupSettings: groupSettings => {
      console.dir(groupSettings);

      return groupSettings.$put({groupId: groupSettings.id}, groupSettings).$promise;
    },
    deleteGroup: group => {
      return groups.remove({groupId: group.id}).$promise;
    }
  };
})

/** @ngInject */
.factory('User', ($resource, ENV) => {
  const users = $resource(`${ENV.api}/user`);
  const superadmin = $resource(`${ENV.api}/superadmin`);

  return {
    getUsers: () => {
      return users.query().$promise;
    },
    superAdminize: username => {
      return superadmin.save({username}).$promise;
    }
  };
})

/** @ngInject */
.factory('Config', ($resource, ENV) => {
  const clientConfig = $resource(`${ENV.api}/clientConfig`);
  const config = $resource(`${ENV.api}/config`);

  return {
    getClientConfig: () => {
      return clientConfig.get().$promise;
    },
    getConfig: () => {
      return config.get().$promise;
    },
    saveConfig: conf => {
      return config.save(conf).$promise;
    }
  };
});
