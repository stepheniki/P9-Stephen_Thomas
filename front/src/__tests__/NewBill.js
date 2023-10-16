/**
 * @jest-environment jsdom
 */

import '@testing-library/jest-dom'
import {fireEvent, getByAltText, getByTestId, screen, waitFor} from "@testing-library/dom"
import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"
import mockStore from "../__mocks__/store"
import {localStorageMock} from "../__mocks__/localStorage.js";
import { ROUTES_PATH, ROUTES} from "../constants/routes.js";
import router from "../app/Router"
import userEvent from '@testing-library/user-event'

//mocking
jest.mock("../app/store", () => mockStore)

//initialisation
Object.defineProperty(window, 'localStorage', { value: localStorageMock })
window.localStorage.setItem('user', JSON.stringify({
  type: 'Employee',
  email: 'employee@test.tld'
}))
const root = document.createElement("div")
root.setAttribute("id", "root")
document.body.append(root)
router()
window.onNavigate(ROUTES_PATH.NewBill)

/***************************************************************************************************/
// Connecté en tant qu'employé, page "nouvelle note de frais"
describe("Given I am a user connected as employee", () => {
  describe("When i'm on new bill page", () => {
    
    // La nouvelle note de frais doit s'afficher
    test('Then new Bill page should be displayed', async () => {
      await waitFor(() => screen.getByText("Envoyer une note de frais"))
      expect(screen.getByText("Envoyer une note de frais")).toBeTruthy()
      expect(screen.getByTestId("file")).toBeTruthy()      
    })  

/***************************************************************************************************/
    describe('when i try to change the file', () => {
      test('Then input a file with incorrect format should remove the file', async () => {
        //create the view and the instance of NewBill
        document.body.innerHTML = NewBillUI()
        const billNew = new NewBill({document, onNavigate, store: mockStore, localStorage: window.localStorage})
        const fileInput = screen.getByTestId('file')
        const newFile = new File(['image.pdf'], 'une-image.pdf' , { type: "image/pdf"})

        //spying the alert box and create function
        const alerting = jest.spyOn(window, "alert").mockImplementation(() => {});
        const spyCreate = jest.spyOn(mockStore.bills(), 'create')
        
        //adding event
        fileInput.addEventListener('change', billNew.handleChangeFile )
        userEvent.upload(fileInput , newFile)
        await new Promise(process.nextTick);

        
        expect(alerting).toBeCalledWith("Le type de fichier saisi n'est pas correct")

        //wrong file type does not call create method
        expect(billNew.goodFileType).toEqual(false)
        expect(billNew.fileUrl).toBeNull()
        expect(billNew.billId).toBeNull()
        expect(fileInput.files).toBeNull()
        expect(spyCreate).not.toHaveBeenCalled()
      })
/***************************************************************************************************/
      // Entrer un fichier avec le format correct
      test('Then input a file with correct format should keep the file and then call create method', async () => {
        jest.clearAllMocks()
        document.body.innerHTML = NewBillUI()

        const billNew = new NewBill({document, onNavigate, store: mockStore, localStorage: window.localStorage})
        const fileInput = screen.getByTestId('file')
        const newFile = new File(['image.jpg'], 'une-image.jpg' , { type: "image/jpeg"})

        const spyCreate = jest.spyOn(mockStore.bills(), 'create')
        const spyUpdate = jest.spyOn(mockStore.bills(), 'update')
        const alerting = jest.spyOn(window, "alert").mockImplementation(() => {});
        

        fileInput.addEventListener('change', billNew.handleChangeFile )
        userEvent.upload(fileInput , newFile)
        await new Promise(process.nextTick);

        
        expect(alerting).not.toBeCalledWith("Le type de fichier saisi n'est pas correct")
        expect(spyUpdate).not.toHaveBeenCalled()
        expect(spyCreate).toHaveBeenCalled()

        //responses of create method
        expect(billNew.fileUrl).toEqual('https://localhost:3456/images/test.jpg')
        expect(billNew.billId).toEqual('1234')
        expect(billNew.fileName).toEqual('une-image.jpg')

        //keeping the file
        expect(billNew.goodFileType).toBeTruthy()
        expect(fileInput.files).not.toBeNull()
        expect(fileInput.files[0]).toStrictEqual(newFile)
      })
    })
    
/***************************************************************************************************/
//                                          TEST POST
/***************************************************************************************************/
// Méthode update : envoyer une requête POST ou PUT au serveur pour mettre à jour les données.
// Description du groupe de tests : Lorsque le formulaire est soumis avec des valeurs correctes
describe('when i submit form with good value', () => {

  // Test : cela devrait appeler la méthode "update"
 test('then it should call the update method', async () => {

        // Effacement de toutes les fonctions espionnées (Mocks) précédentes
        jest.clearAllMocks()

        // Simulation de la structure HTML de la page NewBill
        document.body.innerHTML = NewBillUI()

        // Création de la fonction onNavigate pour simuler la redirection après la méthode "update"
        const onNavigate = (pathname) => {
          document.body.innerHTML = ROUTES({ pathname })
        }

        // Création d'une instance de la classe NewBill avec des données de test
        const billNew = new NewBill({document, onNavigate, store: mockStore, localStorage: window.localStorage})

        // Sélection des éléments HTML représentant les champs du formulaire
        const date = screen.getByTestId('datepicker')
        const amount = screen.getByTestId('amount')
        const pct = screen.getByTestId('pct')
        const file = screen.getByTestId('file')
        const newFile = new File(['image.jpg'], 'une-image.jpg' , { type: "image/jpeg"})
        const name = screen.getByTestId('expense-name')
        const vat = screen.getByTestId('vat')
        const commentary = screen.getByTestId('commentary')
        
        // Sélection du formulaire et du bouton de soumission
        const formSubmit = screen.getByTestId('form-new-bill')
        const submitButton = document.querySelector('#btn-send-bill')
       
        // Espionnage des méthodes "update" et "create" du store
        const spyUpdate = jest.spyOn(mockStore.bills(), 'update')
        const spyCreate = jest.spyOn(mockStore.bills(), 'create')

        // Remplissage du formulaire avec des valeurs correctes
        fireEvent.change(commentary, {target: {value:'Voila un long et important commentaire'}})
        fireEvent.change(name, {target: {value:'Tres grosse dépense'}})
        fireEvent.change(vat, {target: {value:'200'}})
        fireEvent.change(date, {target: {value:'2021-01-01'}})
        fireEvent.change(amount, {target: {value:'220'}})
        fireEvent.change(pct, {target: {value:'10'}})

        // Simulation de la sélection d'un fichier à téléverser
        file.addEventListener('change', billNew.handleChangeFile)
        userEvent.upload(file , newFile)
        await new Promise(process.nextTick);

        // Simulation de la soumission du formulaire
        submitButton.addEventListener('click', billNew.handleSubmit)
        userEvent.click(submitButton)
        await new Promise(process.nextTick);

        // Vérification que la méthode "create" a été appelée        
        expect(spyCreate).toHaveBeenCalled()

        // Vérification que les données du formulaire ont été correctement mises à jour
        expect(billNew.fileUrl).toEqual('https://localhost:3456/images/test.jpg')
        expect(billNew.billId).toEqual('1234')
        
        // Vérification que la méthode "update" a été appelée avec les bonnes valeurs
        expect(spyUpdate).toHaveBeenCalled()
        expect(spyUpdate).toBeCalledWith({"data": "{\"email\":\"employee@test.tld\",\"type\":\"Transports\",\"name\":\"Tres grosse dépense\",\"amount\":220,\"date\":\"2021-01-01\",\"vat\":\"200\",\"pct\":10,\"commentary\":\"Voila un long et important commentaire\",\"fileUrl\":\"https://localhost:3456/images/test.jpg\",\"fileName\":\"une-image.jpg\",\"status\":\"pending\"}", "selector": "1234"})
      })

      /***************************************************************************************************/
      // test pour rendre la page "Note de frais"
      test('it should render Bills page', async () => {
        await waitFor(() => screen.getByText("Mes notes de frais"))
        expect(screen.getByText("Mes notes de frais")).toBeTruthy()
      })
    })
/***************************************************************************************************/
    // Lorsque une erreur se produit sur l'api
    describe("When an error occurs on API", () => {
      beforeEach(() => {
        jest.spyOn(mockStore, "bills")
        Object.defineProperty(
            window,
            'localStorage',
            { value: localStorageMock }
        )
        window.localStorage.setItem('user', JSON.stringify({
          type: 'Employee'
        }))
        const root = document.createElement("div")
        root.setAttribute("id", "root")
        document.body.appendChild(root)
        router()
        window.onNavigate(ROUTES_PATH.NewBill)
      })
/***************************************************************************************************/
      // Gestion des erreurs 404
      test("submit form and fails with 404 message error", async () => {

        mockStore.bills.mockImplementationOnce(() => {
          return {
            update : () =>  {
              return Promise.reject(new Error("Erreur 404"))
            }
          }})
        document.body.innerHTML = NewBillUI()
        const billNew = new NewBill({document, onNavigate, store: mockStore, localStorage: window.localStorage})
        const date = screen.getByTestId('datepicker')
        const amount = screen.getByTestId('amount')
        const pct = screen.getByTestId('pct')
        const file = screen.getByTestId('file')
        const submitButton = document.querySelector('#btn-send-bill')
        const newFile = new File(['image.jpg'], 'une-image.jpg' , { type: "image/jpeg"})
        const spyUpdate = jest.spyOn(mockStore.bills(), 'update')

        fireEvent.change(date, {target: {value:'Salade'}})
        fireEvent.change(amount, {target: {value:'Tomate'}})
        fireEvent.change(pct, {target: {value:'Oignons'}})

        file.addEventListener('change', billNew.handleChangeFile)
        userEvent.upload(file , newFile)
        await new Promise(process.nextTick);

        submitButton.addEventListener('click', billNew.handleSubmit)
        userEvent.click(submitButton)
        await new Promise(process.nextTick);

        expect(spyUpdate).rejects.toEqual(new Error("Erreur 404"))
      })
/***************************************************************************************************/
      // Gestion des erreurs 500
      test("fetches bills from an API and fails with 500 message error", async () => {

        mockStore.bills.mockImplementationOnce(() => {
          return {
            update : () =>  {
              return Promise.reject(new Error("Erreur 500"))
            }
          }})
        document.body.innerHTML = NewBillUI()
        const billNew = new NewBill({document, onNavigate, store: mockStore, localStorage: window.localStorage})
        const date = screen.getByTestId('datepicker')
        const amount = screen.getByTestId('amount')
        const pct = screen.getByTestId('pct')
        const file = screen.getByTestId('file')
        const submitButton = document.querySelector('#btn-send-bill')
        const newFile = new File(['image.jpg'], 'une-image.jpg' , { type: "image/jpeg"})
        const spyUpdate = jest.spyOn(mockStore.bills(), 'update')

        fireEvent.change(date, {target: {value:'Salade'}})
        fireEvent.change(amount, {target: {value:'Tomate'}})
        fireEvent.change(pct, {target: {value:'Oignons'}})

        file.addEventListener('change', billNew.handleChangeFile)
        userEvent.upload(file , newFile)
        await new Promise(process.nextTick);

        submitButton.addEventListener('click', billNew.handleSubmit)
        userEvent.click(submitButton)
        await new Promise(process.nextTick);

        expect(spyUpdate).rejects.toEqual(new Error("Erreur 500"))
      })
  })
    
    
  })
})

/***************************************************************************************************/
