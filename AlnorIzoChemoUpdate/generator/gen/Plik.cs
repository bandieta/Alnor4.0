using System;
using System.Collections.Generic;
using System.Text;

namespace gen
{
    public class Plik
    {

        public static void AddQuantityEtc(System.IO.StreamWriter plik, List<ksztaltka> lista, int i, bool zPlaszczem)
        {
            plik.WriteLine("ITEM_NUMBER");

            //zPlaszczem
            string suffix = string.Empty;
            if (lista[i].izolowana)
                suffix = "__iza";
            if (zPlaszczem)
                suffix = "__izP";
            plik.WriteLine(lista[i].oznaczenie + suffix);
            plik.WriteLine("SPEC");
            plik.WriteLine("");
            plik.WriteLine("MATERIAL");

            string value = lista[i].isChemo ? lista[i].materialChemo : lista[i].material;

            if (zPlaszczem)
            { value = lista[i].plaszcz; }

            switch (value)
            {
                case "Ocynk":
                    plik.WriteLine("OCYNK");
                    break;
                case "Kwasówka":
                    plik.WriteLine("STAINLESS");
                    break;
                case "Aluminium":
                    plik.WriteLine("ALUMINIUM");
                    break;
                default:
                    plik.WriteLine(value);
                    break;
            }

            plik.WriteLine("GAUGE");

            if (lista[i].isChemo)
            {
                plik.WriteLine(lista[i].gruboscChemo);
            }
            else
            {
                lista[i].blacha = lista[i].blacha.Replace(",", ".");
                plik.WriteLine(lista[i].blacha);
            }

            plik.WriteLine("QUANTITY");
            plik.WriteLine(lista[i].sztuk);
            plik.WriteLine("INSULATION_MATERIAL");
            plik.WriteLine("");
            plik.WriteLine("INSULATION_GAUGE");
            plik.WriteLine("");
            plik.WriteLine("INSULATION_SIDE");
            plik.WriteLine("");
            plik.WriteLine("NOTES");
            if (lista[i].tab[16].Length > 0)
                plik.Write(lista[i].tab[16] + ", ");
            if (zPlaszczem)
                plik.WriteLine(lista[i].pelny_symbolIz);
            else
                plik.WriteLine(lista[i].pelny_symbol);
            plik.WriteLine("ITEMHEADER_END");
            plik.WriteLine("DIMS_START");
        }

        public static void AddPrefix(System.IO.StreamWriter plik)
        {
            plik.WriteLine("ITEM_START");
            plik.WriteLine("ITEMHEADER_START");
            plik.WriteLine("ITEMFILE");
        }

        public static void AddSuffix(System.IO.StreamWriter plik)
        {
            plik.WriteLine("DIMS_END");
            plik.WriteLine("OPTIONS_START");
            plik.WriteLine("OPTIONS_END");
            plik.WriteLine("CONNS_START");
            plik.WriteLine("CONNS_END");
            plik.WriteLine("SEAMS_START");
            plik.WriteLine("SEAMS_END");
            plik.WriteLine("ITEM_END");
        }


        public static void DodajNazwePliku(System.IO.StreamWriter plik, List<ksztaltka> lista, int i, bool izolowana)
        {
            if (lista[i].plaszcz != null && lista[i].plaszcz.Contains("Bez Płaszcza"))
            { izolowana = false; }

            switch (lista[i].symbol)
            {
                case "QDa":
                    if (izolowana) plik.WriteLine("C:/CAM/REMOTE-WZORCE-IZOL/_KANAŁ.ITM");
                    else plik.WriteLine("C:/CAM/REMOTE-WZORCE/KANAŁ.ITM");
                    break;
                case "QBNa":
                    if (izolowana) plik.WriteLine("C:/CAM/REMOTE-WZORCE-IZOL/_ŁUK PROSTY.ITM");
                    else plik.WriteLine("C:/CAM/REMOTE-WZORCE/ŁUK PROSTY.ITM");
                    break;
                case "QBa":
                    if (izolowana) plik.WriteLine("C:/CAM/REMOTE-WZORCE-IZOL/_ŁUK PROSTY.ITM");
                    else plik.WriteLine("C:/CAM/REMOTE-WZORCE/ŁUK PROSTY.ITM");
                    break;
                case "QPR6a":
                    if (izolowana) plik.WriteLine("C:/CAM/REMOTE-WZORCE-IZOL/_REDUKCJA SYMETRYCZNA.ITM");
                    else plik.WriteLine("C:/CAM/REMOTE-WZORCE/REDUKCJA SYMETRYCZNA.ITM");
                    break;
                case "PR1a":
                    if (izolowana) plik.WriteLine("C:/CAM/REMOTE-WZORCE-IZOL/_KWADRAT-KOŁO.ITM");
                    else plik.WriteLine("C:/CAM/REMOTE-WZORCE/KWADRAT-KOŁO.ITM");
                    break;
                case "PR7a":
                    if (izolowana) plik.WriteLine("C:/CAM/REMOTE-WZORCE-IZOL/_KWADRAT-KOŁO ASYM..ITM");
                    else plik.WriteLine("C:/CAM/REMOTE-WZORCE/KWADRAT-KOŁO ASYM..ITM");
                    break;
                case "QPR2a":
                    if (izolowana) plik.WriteLine("C:/CAM/REMOTE-WZORCE-IZOL/_REDUKCJA ASYMETRYCZNA.ITM");
                    else plik.WriteLine("C:/CAM/REMOTE-WZORCE/REDUKCJA ASYMETRYCZNA.ITM");
                    break;
                case "QBRa":
                    if (izolowana) plik.WriteLine("C:/CAM/REMOTE-WZORCE-IZOL/_ŁUK REDUKCYJNY.ITM");
                    else plik.WriteLine("C:/CAM/REMOTE-WZORCE/ŁUK REDUKCYJNY.ITM");
                    break;
                case "QBR1a":
                    if (izolowana) plik.WriteLine("C:/CAM/REMOTE-WZORCE-IZOL/_ŁUK DYFUZOROWY.ITM");
                    else plik.WriteLine("C:/CAM/REMOTE-WZORCE/ŁUK DYFUZOROWY.ITM");
                    break;
                case "QBFRa":
                    if (izolowana) plik.WriteLine("C:/CAM/REMOTE-WZORCE-IZOL/_KOLANO REDUKCYJNE.ITM");
                    else plik.WriteLine("C:/CAM/REMOTE-WZORCE/KOLANO REDUKCYJNE.ITM");
                    break;
                case "QBFa":
                    if (izolowana) plik.WriteLine("C:/CAM/REMOTE-WZORCE-IZOL/_KOLANO PROSTE.ITM");
                    else plik.WriteLine("C:/CAM/REMOTE-WZORCE/KOLANO PROSTE.ITM");
                    break;
                case "QESa":
                    if (izolowana) plik.WriteLine("C:/CAM/REMOTE-WZORCE-IZOL/_ZAŚLEPKA.ITM");
                    else plik.WriteLine("C:/CAM/REMOTE-WZORCE/ZAŚLEPKA.ITM");
                    break;
                case "TR1a":
                    if (izolowana) plik.WriteLine("C:/CAM/REMOTE-WZORCE-IZOL/_TRÓJNIK KANAŁOWY.ITM");
                    else plik.WriteLine("C:/CAM/REMOTE-WZORCE/TRÓJNIK KANAŁOWY.ITM");
                    break;
                case "TR7a":
                    if (izolowana) plik.WriteLine("C:/CAM/REMOTE-WZORCE-IZOL/_TRÓJNIK SKOŚNY.ITM");
                    else plik.WriteLine("C:/CAM/REMOTE-WZORCE/TRÓJNIK SKOŚNY.ITM");
                    break;
                case "TR4a":
                    if (izolowana) plik.WriteLine("C:/CAM/REMOTE-WZORCE-IZOL/_TRÓJNIK KOLANOWY.ITM");
                    else plik.WriteLine("C:/CAM/REMOTE-WZORCE/TRÓJNIK KOLANOWY.ITM");
                    break;
                case "TR5a":
                    if (izolowana) plik.WriteLine("C:/CAM/REMOTE-WZORCE-IZOL/_TRÓJNIK PORTKOWY.ITM");
                    else plik.WriteLine("C:/CAM/REMOTE-WZORCE/TRÓJNIK PORTKOWY.ITM");
                    break;
                case "QD1a":
                    if (izolowana) plik.WriteLine("C:/CAM/REMOTE-WZORCE-IZOL/_ODGAŁĘZIENIE.ITM");
                    else plik.WriteLine("C:/CAM/REMOTE-WZORCE/ODGAŁĘZIENIE.ITM");
                    break;
                case "QD2a":
                    if (izolowana) plik.WriteLine("C:/CAM/REMOTE-WZORCE-IZOL/_SZTUCER.ITM");
                    else plik.WriteLine("C:/CAM/REMOTE-WZORCE/SZTUCER.ITM");
                    break;
                case "TR3a":
                    if (izolowana) plik.WriteLine("C:/CAM/REMOTE-WZORCE-IZOL/_TRÓJNIK ORŁOWY.ITM");
                    else plik.WriteLine("C:/CAM/REMOTE-WZORCE/TRÓJNIK ORŁOWY.ITM");
                    break;
                case "TR6a":
                    if (izolowana) plik.WriteLine("C:/CAM/REMOTE-WZORCE-IZOL/_NAKŁADKA.ITM");
                    else plik.WriteLine("C:/CAM/REMOTE-WZORCE/NAKŁADKA.ITM");
                    break;
                case "QPR4a":
                    if (izolowana) plik.WriteLine("C:/CAM/REMOTE-WZORCE-IZOL/_ODSADZKA ASYMETRYCZNA.ITM");
                    else plik.WriteLine("C:/CAM/REMOTE-WZORCE/ODSADZKA ASYMETRYCZNA.ITM");
                    break;
                case "QPR3a":
                    if (izolowana) plik.WriteLine("C:/CAM/REMOTE-WZORCE-IZOL/_ODSADZKA PROSTA.ITM");
                    else plik.WriteLine("C:/CAM/REMOTE-WZORCE/ODSADZKA PROSTA.ITM");
                    break;
                case "TRa":
                    if (izolowana) plik.WriteLine("C:/CAM/REMOTE-WZORCE-IZOL/_TRÓJNIK PROSTY.ITM");
                    else plik.WriteLine("C:/CAM/REMOTE-WZORCE/TRÓJNIK PROSTY.ITM");
                    break;
                case "TR2a":
                    if (izolowana) plik.WriteLine("C:/CAM/REMOTE-WZORCE-IZOL/_TRÓJNIK KWADRAT-KOŁO.ITM");
                    else plik.WriteLine("C:/CAM/REMOTE-WZORCE/TRÓJNIK KWADRAT-KOŁO.ITM");
                    break;
                case "TR8a":
                    if (izolowana) plik.WriteLine("C:/CAM/REMOTE-WZORCE-IZOL/_TR8.ITM");
                    else plik.WriteLine("C:/CAM/REMOTE-WZORCE/TR8.ITM");
                    break;
                case "TR9a":
                    if (izolowana) plik.WriteLine("C:/CAM/REMOTE-WZORCE-IZOL/_TR9.ITM");
                    else plik.WriteLine("C:/CAM/REMOTE-WZORCE/TR9.ITM");
                    break;
                case "CZ1a":
                    if (izolowana) plik.WriteLine("\\\\Vs-alnor\\CAM_DUCT_2019\\ItemFiles2019\\PROSTOKĄTY\\DO EDYCJI STANDARDY\\CZWÓRNIK Z OD. PROST..png");
                    else plik.WriteLine("\\\\Vs-alnor\\CAM_DUCT_2019\\ItemFiles2019\\PROSTOKĄTY\\DO EDYCJI STANDARDY\\CZWÓRNIK Z OD. PROST..png");
                    break;
                case "CZ2a":
                    if (izolowana) plik.WriteLine("\\\\Vs-alnor\\CAM_DUCT_2019\\ItemFiles2019\\PROSTOKĄTY\\DO EDYCJI STANDARDY\\CZWÓRNIK Z OD. OKRĄGŁYM.bmp");
                    else plik.WriteLine("\\\\Vs-alnor\\CAM_DUCT_2019\\ItemFiles2019\\PROSTOKĄTY\\DO EDYCJI STANDARDY\\CZWÓRNIK Z OD. OKRĄGŁYM.bmp");
                    break;


            }
        }

    }
}
