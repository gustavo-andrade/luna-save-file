import { FileTransfer, FileUploadOptions, FileTransferObject } from '@ionic-native/file-transfer';
import { File, IFile, Entry } from '@ionic-native/file';
import { Component } from '@angular/core';
import { ModalController, NavParams, AlertController, LoadingController } from 'ionic-angular';

/**
 * Luna Save File Manager
 * 
 * Developed by Gustavo H. S. Andrae
 * 
 * Create an interface to save a file on user's device
 *
 */
@Component({
  selector: 'luna-save-file',
  templateUrl: 'luna-save-file.html'
})
export class LunaSaveFile {

  // List of Entries
  private entries:Entry[];
  private parentEntry:Entry = null;
  private currentEntry:Entry;


  private title:string;
  private url:string; // Url of file to download
  private callback; // callback function that return true/false

  private fileTransfer: FileTransferObject = this.transfer.create();

  constructor(
    private modalCtrl:ModalController,
    private file:File,
    private navParams:NavParams,
    private alertCtrl:AlertController,
    private transfer: FileTransfer,
    private loadingCtrl:LoadingController
  ) {

    this.title    = navParams.get('title');
    this.url      = navParams.get('url');
    this.callback = navParams.get('callback');

    this.setRootDirectory();

  }



  setRootDirectory()
  {
    // List root directores
    let filesystem = this.file.externalRootDirectory;
    
    this.file.listDir(filesystem, '').then(
      (entries) => {
      
      this.entries = entries;

    
      // Set current directory
      let currentEntry;
      entries[0].getParent((current) => {
        currentEntry = current;
      });

      setTimeout(()=> {
        console.log('PARENT 4: '+currentEntry.isDirectory);
          this.currentEntry = currentEntry;
      }, 100)

      }
    )
    
  }



   /*
  Return an array with list of subdirectories
  */
  openDirectory(entry:any)
  {

    if(entry.isFile)
    {
      let alert = this.alertCtrl.create({
        message: "You can't save on a file",
        buttons: ['Ok']
      });

      alert.present();
      
      return false;
    }
    
    this.currentEntry = entry;

    let url = entry.fullPath;

    // Set parent directory
    let parentEntry = null;
    entry.getParent(function(parent){
        parentEntry = parent;
    });
    
    setTimeout(() => {
        this.parentEntry = parentEntry;
    }, 100);


    
    // List directories
    return this.file.resolveDirectoryUrl(this.file.externalRootDirectory+url)
    .then((directoryEntry) => {

      let reader = directoryEntry.createReader();
      let entriesList;

      reader.readEntries(function(entries) {
          entriesList = entries;
      });

      setTimeout(() => {
        this.entries = entriesList;
      }, 100)
    })

  }


  // Download and save de File on current directory
  startDownload()
  {


    let alertGetName = this.alertCtrl.create({
        title: 'Save File',
        inputs: [
          {
            name:'name',
            placeholder: 'Name do save'
          },
        ],
        buttons: [
          'Cancel',
          {
            text: 'Save',
            handler: data => {

              this.saveFile(data.name);

            }
          } 
        ]
    });

    alertGetName.present();
    
  }


  saveFile(name:string)
  {
    // Save File
    let extension = this.getFileExtension(this.url);
    let pathSave = this.file.externalRootDirectory+this.currentEntry.fullPath+name+'.'+extension;

    let loading  = this.loadingCtrl.create({
      content: 'Downloading...'
    });

    loading.present();

    console.log('DOWNLOAD DE: '+this.url );

    console.log('SALVANDO EM: '+pathSave);

    this.fileTransfer.download(this.url, pathSave)
    .then((resDownload) => {
      console.log('Download concluído: ')
      loading.dismiss();

      let alertSuccess = this.alertCtrl.create({
        message: 'File was successfully transfered.',
        buttons: [
          'OK'
        ]
      
      });

      this.callback(true);

      alertSuccess.present();

    }, (error) => {
      console.log('ERROR DE DOWNLOAD: ');
      console.log(error);
      loading.dismiss();

      let alertError = this.alertCtrl.create({
        message: "File could not be downloaded.",
        buttons: [
          'OKD'
        ]
      })

      this.callback(false);

      alertError.present();

    });

  }


  getFileExtension(url:string):string
  {
    let stringArray = url.split('.');
    return stringArray[stringArray.length-1];
  }



}
