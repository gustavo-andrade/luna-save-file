import { FileTransfer, FileTransferObject } from '@ionic-native/file-transfer';
import { File, Entry } from '@ionic-native/file';
import { Component } from '@angular/core';
import { NavParams, AlertController, LoadingController } from 'ionic-angular';
import {messages}  from  './messages'

/**
 * Luna Save File Manager
 * 
 * Developed by Gustavo H. S. Andrade
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


  private title:string; // Title of the page
  private url:string; // Url of file to download
  private callback; // callback function that return true/false

  private fileTransfer: FileTransferObject = this.transfer.create();

  constructor(
    private file:File,
    private navParams:NavParams,
    private alertCtrl:AlertController,
    private transfer: FileTransfer,
    private loadingCtrl:LoadingController,
    
  ) {

    this.title    = this.navParams.get('title');
    this.url      = this.navParams.get('url');
    this.callback = this.navParams.get('callback');

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
          this.currentEntry = currentEntry;
      }, 100)

      }
    ).catch((error) => {
      console.log("Error: ");
      console.log(error);

      let alert = this.alertCtrl.create({
        title: 'Error',
        message: messages.no_permission,
        buttons: [
          { 
            text:'OK',
            handler: () => {
              this.callback(false);
            }
          }
        ]
      })

      alert.present();

    })
    
  }



   /*
  Return an array with list of subdirectories
  */
  openDirectory(entry:any)
  {

    if(entry.isFile)
    {
      let alert = this.alertCtrl.create({
        message: messages.cant_save_on_file,
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
        title: messages.save_title,
        inputs: [
          {
            name:'name',
            placeholder: messages.name_file
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
      content: messages.downloading_message
    });
  
    let uri = encodeURI(this.url);

    loading.present();

    // Headers do download
    let options = {};

    if(options == 'pdf')
    {
        options = {
          headers: {
                // "content-type": "application/pdf"
          }
        }
    };

    this.fileTransfer.download(uri, pathSave, true, options)
    .then((resDownload) => {
      loading.dismiss();

      let alertSuccess = this.alertCtrl.create({
        message: messages.successful_download, // File was successfully transfered.
        buttons: [
          'OK'
        ]
      
      });

      this.callback(true);

      alertSuccess.present();

    }, (error) => {
      
      loading.dismiss();

      let alertError = this.alertCtrl.create({
        message: messages.error_download,  // File could not be downloaded.
        buttons: [
          'OK'
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
