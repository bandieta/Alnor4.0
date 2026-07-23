using System;
using System.Collections.Generic;
using System.Text;
using System.IO;
using System.Windows.Forms;
using System.Xml.Serialization;

namespace WindowsApplication1
{
    public class DictionariesManager
    {
        static DictionariesManager manager;
        CurrentLanguage currentLanguage = CurrentLanguage.Polski;

        Dictionary<string, string> pol2ang = new Dictionary<string, string>();
        Dictionary<string, string> pol2ros = new Dictionary<string, string>();
        Dictionary<string, string> pol2niem  = new Dictionary<string, string>();
        Dictionary<string, string> pol2weg = new Dictionary<string, string>();


        public Dictionary<string, string> GetCurrentDictionary()
        {
            switch (currentLanguage)
            {
                case CurrentLanguage.Polski:
                    return null;
                case CurrentLanguage.Angielski:
                    return pol2ang;
                case CurrentLanguage.Rosyjski:
                    return pol2ros;
                case CurrentLanguage.Niemiecki:
                    return pol2niem;
                case CurrentLanguage.Węgierski:
                    return pol2niem;
                default:
                    return null;
            }
        }

        public CurrentLanguage Language
        {
            get { return currentLanguage; }
            set { currentLanguage = value; }
        }

        public Dictionary<string, string> Pol2Ang
        { get { return pol2ang; } }

        public Dictionary<string, string> Pol2Ros
        { get { return pol2ros; } }

        public Dictionary<string, string> Pol2Niem
        { get { return pol2niem; } }

        public Dictionary<string, string> Pol2Weg
        { get { return pol2weg; } }
        
        public static DictionariesManager Manager
        { 
            get 
            {
                if (manager == null)
                {
                    manager = new DictionariesManager();
                    manager.LoadDictionaries();
                }
                return manager;
            } 
        }

        private void LoadDictionaries()
        {
            string path = Application.StartupPath + "\\slownik.txt";
            if(!File.Exists(path))
            {  MessageBox.Show(" Błąd ładowania słownika !"); return; }

            StreamReader reader = new StreamReader(path, Encoding.Unicode);
            string line;
            while (!String.IsNullOrEmpty(line = reader.ReadLine()))
            {
                string[] dicts = line.Split(';');

                if (dicts.Length != 5)
                { MessageBox.Show(" Błąd ładowania słownika !"); return; }
                if (!pol2ang.ContainsKey(dicts[0]))
                { pol2ang.Add(dicts[0], dicts[1]); }
                if (!pol2ros.ContainsKey(dicts[0]))
                { pol2ros.Add(dicts[0], dicts[2]); }
                if (!pol2niem.ContainsKey(dicts[0]))
                { pol2niem.Add(dicts[0], dicts[3]); }
                if (!pol2weg.ContainsKey(dicts[0]))
                { pol2weg.Add(dicts[0], dicts[4]); }
            }
        }

        

        public void Serialize()
        {
            XmlSerializer s = new XmlSerializer(typeof(CurrentLanguage));
            StreamWriter writer = new StreamWriter(System.Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData) + "\\lang.dat");
            s.Serialize(writer, currentLanguage);
            writer.Close();
        }

        public void Deserialize()
        {
            try
            {
                XmlSerializer s = new XmlSerializer(typeof(CurrentLanguage));
                StreamReader reader = new StreamReader(System.Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData) + "\\lang.dat");
                currentLanguage = (CurrentLanguage)s.Deserialize(reader);
                reader.Close();
            }
            catch { }
        }
    }
}
