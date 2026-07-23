using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Data;
using System.Drawing;
using System.Text;
using System.Windows.Forms;

namespace WindowsApplication1
{
    public partial class Form4 : Form, IMultiLang
    {
        public Form4()
        {
            InitializeComponent();
        }

        private void richTextBox1_TextChanged(object sender, EventArgs e)
        {

        }

        private void pictureBox1_Click(object sender, EventArgs e)
        {

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
            this.Text = this.Text.Replace(from, to);
            richTextBox1.Text = richTextBox1.Text.Replace(from, to);

        }

        #endregion

        private void Form4_Load(object sender, EventArgs e)
        {
            Translate(DictionariesManager.Manager.GetCurrentDictionary());
        }
    }
}