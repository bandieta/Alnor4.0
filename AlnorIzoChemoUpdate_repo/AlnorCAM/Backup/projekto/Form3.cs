using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Data;
using System.Drawing;
using System.Text;
using System.Windows.Forms;

namespace WindowsApplication1
{
    public partial class Form3 : Form, IMultiLang
    {
        public string nazwa;
        public string zamawia;
        public string data;

        public Form3()
        {
            InitializeComponent();
        }

        public void wylpelnij(String a, String b, String c)
        {
            textBox1.Text = a;
            textBox2.Text = b;
            dateTimePicker1.Text = c;
        }
        private void button1_Click(object sender, EventArgs e)
        {
            nazwa = textBox1.Text;
            zamawia = textBox2.Text;
            data = dateTimePicker1.Text;
            Close();
        }

        private void Form3_Load(object sender, EventArgs e)
        {
            Translate(DictionariesManager.Manager.GetCurrentDictionary());
        }

        #region IMultiLang Members

        public void Translate(Dictionary<string, string> dict)
        {
            if (dict != null)
            foreach (string item in dict.Keys)
            { TryTranslate(item, dict[item]); }
        }

        private void TryTranslate(string from, string to)
        {
            label1.Text = label1.Text.Replace(from, to);
            label2.Text = label2.Text.Replace(from, to);
            this.Text = this.Text.Replace(from, to);
            button1.Text = button1.Text.Replace(from, to);
        }

        #endregion
    }
}