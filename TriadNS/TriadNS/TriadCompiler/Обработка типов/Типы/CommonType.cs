using System;
using System.Collections.Generic;
using System.Text;

namespace TriadCompiler
    {
    /// <summary>
    /// ����� ���
    /// </summary>
    public interface ICommonType
        {
        /// <summary>
        /// ��� ����������
        /// </summary>
        string Name
            {
            get;
            set;
            }


        
        }

    /// <summary>
    /// ��������� ���������������� ����
    /// </summary>
    public interface IIndexedType
    {
        void SetNewIndex(int indexMaxValue);

        int IndexCount
        {
            get;
        }

        bool IsValidIndex(int indexValue, int indexNumber);

        int GetUpperBound(int indexNumber);
    }

    /// <summary>
    /// ���������� ��������������� ���
    /// </summary>
    internal class IndexedType : IIndexedType
        {
        /// <summary>
        /// ������ ����� ������
        /// </summary>
        /// <param name="indexMaxValue">������� ������� ��������� �������</param>
        /// <exception cref="ArgumentException">����� ������� ������� ������, ��� ������
        /// </exception>
        public void SetNewIndex( int indexMaxValue )
            {
            if ( indexMaxValue < 0 )
                throw new ArgumentException( "������� ������� ��������� ������� ������ ���� ��������������" );

            arrIndexMaxSizeList.Add( indexMaxValue );
            }


        /// <summary>
        /// �������� ����������� �������
        /// </summary>
        public int IndexCount
            {
            get
                {
                return arrIndexMaxSizeList.Count;
                }
            }


        /// <summary>
        /// �������� �������������� �������� ������� ��� ������������ ���������
        /// </summary>
        /// <param name="indexValue">�������� �������</param>
        /// <param name="indexNumber">���������� ����� �������</param>
        /// <returns>true, ���� �������� ������� �������� � �������</returns>
        public bool IsValidIndex( int indexValue, int indexNumber )
            {
            if ( indexNumber > arrIndexMaxSizeList.Count - 1 )
                return false;
            else if ( indexNumber < 0 )
                return false;

            return ( 0 <= indexValue ) && ( indexValue < arrIndexMaxSizeList[ indexNumber ] );
            }

        /// <summary>
        /// �������� ������� ������� �������
        /// </summary>
        /// <param name="indexNumber">���������� ����� �������</param>
        /// <returns>������� �������</returns>
        public int GetUpperBound(int indexNumber)
        {
            if (indexNumber < 0 || indexNumber > arrIndexMaxSizeList.Count)
                throw new ArgumentOutOfRangeException();

            return arrIndexMaxSizeList[indexNumber];
        }

        /// <summary>
        /// �������� ������� �� ������� �������� ��������
        /// </summary>
        /// <returns></returns>
        public IEnumerator<int> GetEnumerator()
            {
            return this.arrIndexMaxSizeList.GetEnumerator();
            }


        //������� ������� �������� �������
        protected List<int> arrIndexMaxSizeList = new List<int>();
        }
    }
