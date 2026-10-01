import { Schema, model } from 'mongoose';
const orderSchema = new Schema({
     userId: {
        type: Schema.Types.ObjectId, // Hier Mongoose-Laufzeittyp festlegen
        ref: 'User'
    },    
     books: [
    {
      //_id: false, // Verhindert, dass Mongoose automatisch eine eigene _id für jedes Array-Element generiert: aber eigentlich statt _id -> id???
      bookId: {
        type: Schema.Types.ObjectId,
        ref: 'Book', // Name des referenzierten Models für .populate()
        //required: true
      },
      quantity: {
        type: Number,
        required: true,
        min: [1, 'Die Menge muss mindestens 1 betragen.'],
        default: 1
      },
      //hier per boolean: isLend: { type: Boolean, default: false } // Optionales Feld für den Status "geliehen" etc.
     
    }
  ],
    // total: {
    //     type: Number,
    //     //required: [true, 'Price is required'],
    //     min: [0, 'Price must be a positive number']
    // }
   
}, {
    timestamps: true  //plus timestamps?
});
export default model('Order', orderSchema);