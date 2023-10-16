/**
 * @jest-environment jsdom
 */

import '@testing-library/jest-dom'
import {fireEvent, getByAltText, getByTestId, screen, waitFor} from "@testing-library/dom"
import BillsUI from "../views/BillsUI.js"
import { bills } from "../fixtures/bills.js"
import { ROUTES_PATH} from "../constants/routes.js";
import {localStorageMock} from "../__mocks__/localStorage.js";
import mockStore from "../__mocks__/store"

import router from "../app/Router.js";

/***************************************************************************************************/
//                                          DEROULEMENT D'UN TEST STANDARD
/***************************************************************************************************/
// Utilisation de jest.mock pour simuler le comportement du store de l'application
jest.mock("../app/store", () => mockStore)

// Début du test : l'utilisateur est connecté en tant qu'employé
describe("Given I am connected as an employee", () => {

  // Lorsque je suis sur la page des notes de frais
  describe("When I am on Bills Page", () => {

    // Test : l'icône des notes de frais dans le layout vertical doit être mise en surbrillance
    test("Then bill icon in vertical layout should be highlighted", async () => {

      // Configuration du localStorage avec les informations d'un utilisateur de type "Employee"
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))

      // Création d'un élément de racine dans le DOM
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)

      // Simulation de la navigation vers la page des notes de frais
      router()
      window.onNavigate(ROUTES_PATH.Bills)

      // Recherche de l'icône de la fenêtre dans le layout vertical
      const windowIcon = await screen.getByTestId('icon-window')

      // Vérification que l'icône de la fenêtre est mise en surbrillance (classe 'active-icon')
      expect(windowIcon).toHaveClass('active-icon')
    })
/***************************************************************************************************/

    // les notes de frais sont affichées dans l'ordre décroissant
    test("Then bills should be ordered from earliest to latest", () => {
      document.body.innerHTML = BillsUI({ data: bills })
      const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML)
      const antiChrono = (a, b) => ((a < b) ? 1 : -1)
      const datesSorted = [...dates].sort(antiChrono)
      expect(dates).toEqual(datesSorted)
    })
  })

    // En cliquant sur "nouvelle note de frais", cette page s'affiche
    test('Then button new bills should render new bill page', async () => {
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.Bills)
      const buttonNewBill = await screen.getByText('Nouvelle note de frais')
      fireEvent.click(buttonNewBill)
      const newBill = await screen.getByText('Envoyer une note de frais')
      expect(newBill).toBeTruthy()
    })

    //  Au clic sur l'oeil, ouverture de l'image dans la modale
    test('Then eye-icon button should shows right image modal', async () => {
      
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.Bills)
      await waitFor(() => screen.getByText("Mes notes de frais"))

      // on regarde simplement si la modale s'affiche en regardant l'alt de l'image
      const modalFile = document.getElementById('modaleFile')
      $.fn.modal = jest.fn(() => modalFile.classList.add('show'))
      const eyeButton = screen.getAllByTestId('icon-eye')

      fireEvent.click(eyeButton[1])
      const url = eyeButton[1].dataset.billUrl
      const modal = screen.getByAltText('Bill')
      const modalSrc = modal.src.replace('%E2%80%A6','…')
      // la modale s'affiche 
      expect(modal).toBeVisible()
      expect(modalFile).toHaveClass('show')
      // la bonne image s'affiche
      expect(modalSrc).toBe(url)
      
    })
})


/***************************************************************************************************/
//                           Test d'intégration GET avec erreurs 404 et 500
/***************************************************************************************************/
// test GET car il vérifie la récupération et l'affichage des données depuis l'API (simulé par mockStore.bills). 
// Il ne modifie pas les données, mais vérifie plutôt si les données sont correctement récupérées et présentées à l'utilisateur.


describe("Given I am a user connected as Employee", () => {
  describe("When I navigate to Bills Page", () => {
    test("fetches bills from mock API GET", async () => {

      // Simuler un utilisateur connecté de type Employee
      localStorage.setItem("user", JSON.stringify({ type: "Employee"}));

      // Créer un élément div pour représenter la racine de l'application
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()

      // Naviguer vers la page "Bills"
      window.onNavigate(ROUTES_PATH.Bills)

      // Attendre que le contenu de la page soit chargé
      await waitFor(() => screen.getByText("Mes notes de frais"))

      // Vérifier si les données des notes de frais sont correctement affichées
      const content1 = screen.getByText('encore')
      expect(content1).toBeDefined()
      const content2 = screen.getByText('test1')
      expect(content2).toBeDefined()
      const content3 = screen.getByText('test3')
      expect(content3).toBeTruthy()
      const content4 = screen.getByText('test2')
      expect(content4).toBeDefined()

      // Vérifier la présence des icônes d'œil pour chaque note de frais
      expect(screen.getAllByTestId('icon-eye').length).toEqual(4)

      // Vérifier la présence de la modale pour l'affichage des notes de frais
      expect(screen.getByText('Justificatif')).toBeVisible()

      // Vérifier la présence du bouton pour une nouvelle note de frais
      expect(screen.getByTestId('btn-new-bill')).toHaveTextContent('Nouvelle note de frais')

      // Vérifier la présence de l'élément d'interface utilisateur contenant les données des notes de frais
      expect(screen.getByTestId("tbody")).toBeDefined()

      // Vérifier la présence des 4 notes de frais dans l'élément d'interface utilisateur
      expect(screen.getByTestId("tbody")).toHaveTextContent('encore')
      expect(screen.getByTestId("tbody")).toHaveTextContent('test1')
      expect(screen.getByTestId("tbody")).toHaveTextContent('test3')
      expect(screen.getByTestId("tbody")).toHaveTextContent('test2')
    })

                                   /*************************************/
  // Lorsqu'une erreur se produit sur l'API...
  describe("When an error occurs on API", () => {
    beforeEach(() => {

      // Espionner l'appel à la méthode bills() du mockStore
      jest.spyOn(mockStore, "bills")

      // Définir localStorage pour simuler un utilisateur connecté de type Employee
      Object.defineProperty(
          window,
          'localStorage',
          { value: localStorageMock }
      )
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))

      // Créer un élément div pour représenter la racine de l'application
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.appendChild(root)

      // Configurer le router pour l'application
      router()
    })
                          
    // Cas de test en cas d'erreur 404 lors de la récupération des données depuis l'API 
    test("fetches bills from an API and fails with 404 message error", async () => {

      mockStore.bills.mockImplementationOnce(() => {
        return {
          list : () =>  {
            return Promise.reject(new Error("Erreur 404"))
          }
        }})

      // Naviguer vers la page "Bills"
      window.onNavigate(ROUTES_PATH.Bills)

      // Attendre le prochain cycle de l'événement pour permettre le rendu
      await new Promise(process.nextTick);

      // Vérifier si le message d'erreur 404 est affiché sur la page
      const message = await screen.getByText(/Erreur 404/)
      expect(message).toBeTruthy()
    })

                                   /*************************************/

    // Cas de test en cas d'erreur 500 lors de la récupération des données depuis l'API
    test("fetches messages from an API and fails with 500 message error", async () => {
      
      // Simuler une réponse d'API avec une erreur 500
      mockStore.bills.mockImplementationOnce(() => {
        return {
          list : () =>  {
            return Promise.reject(new Error("Erreur 500"))
          }
        }})

      // Naviguer vers la page "Bills"
      window.onNavigate(ROUTES_PATH.Bills)

      // Attendre le prochain cycle de l'événement pour permettre le rendu
      await new Promise(process.nextTick);

      // Vérifier si le message d'erreur 500 est affiché sur la page
      const message = await screen.getByText(/Erreur 500/)
      expect(message).toBeTruthy()
    })
  })

  })
})
