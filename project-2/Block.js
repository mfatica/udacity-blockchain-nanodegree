/* ===== Block Class ==============================
|  Class with a constructor for block 			   |
|  ===============================================*/

module.exports = class Block{
	constructor(data){
     this.hash = "",
     this.height = 0,
     this.body = data,
     this.time = 0,
     this.previousBlockHash = ""
    }
}