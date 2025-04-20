using System;
using System.Collections.Generic;
using System.Text;
using System.Reflection;

namespace TriadCore
    {
    /// <summary>
    /// ���������� ���������
    /// </summary>
    /// <param name="Info">������ ��������</param>
    /// <param name="systemTime">����� ���������</param>
    public delegate void SpyHandler( SpyObject Info, double systemTime );

    /// <summary>
    /// ������
    /// </summary>
    public class Routine : ReflectionObject, ICreatable
        {
        /// <summary>
        /// ������ � ������ ���������� �������
        /// </summary>
        protected const int DefaultIndex = -1;
        /// <summary>
        /// ������ ������, ���������� ���������
        /// </summary>
        private int indexOfPolusReceivedMessage = -1;


        /// <summary>
        /// ������� ����� ������ (���������� ��� ������������� ��������)
        /// </summary>
        /// <returns>����� ������</returns>
        public object CreateNew()
            {
            return new Routine();
            }


        /// <summary>
        /// ������������ �������
        /// </summary>
        /// <param name="deltaTime">����� �������� ������������ �������</param>
        /// <param name="eventHandlerList">����������� �������, ������������ � ��� �����</param>
        protected void Schedule( double deltaTime, params InternalEventHandler[] eventHandlerList )
            {
            if ( this.baseNode != null )
                {
                foreach ( InternalEventHandler eventHandler in eventHandlerList )
                    {
                    //��������� ����� deltaTime ������ �������
                    InternalEvent ev = new InternalEvent( deltaTime + this.SystemTime, this );
                    ev.EventHandler += eventHandler;

                    CoreName eventCoreName = new CoreName( eventHandler.Method.Name );
                    
                    //��������� ����� ����������� ��
                    if ( this.spyHandlerList.ContainsKey( eventCoreName ) )
                        foreach ( SpyHandler handler in this.spyHandlerList[ eventCoreName ] )
                            {
                            ev.EventSpyHandler += handler;
                            }

                    this.eventCalendar.PlaneEvent( ev ); 
                    }
                }
            }


        /// <summary>
        /// �������� ��������� ������� � ������ �������������
        /// </summary>
        /// <param name="eventHandlerList">����������� �������</param>
        protected void Cancel( params InternalEventHandler[] eventHandlerList )
            {
            //***********************************************
            // ��������
            //***********************************************
            }

        
        /// <summary>
        /// ������� ��������� ����� �����
        /// </summary>
        /// <param name="message">���������</param>
        /// <param name="routinePolusName">��� ������ ������, ����� ������� ���������� ���������</param>
        protected void SendMessageVia( string message, CoreName routinePolusName )
            {
            if ( message == null )
                throw new ArgumentNullException( "message" );

            if ( this.baseNode != null )
                {
                //���� ����� ������ ������ � ������� �������
                if ( this.routineNodePolusPairs.ContainsKey( routinePolusName ) )
                    //���� ����� ������ �� ��������� � ������ ���������������
                    if ( !this.routineBlockedPolusList.Contains( routinePolusName ) )
                        //�������� ��������� �� ��������� ������ �������
                        foreach ( CoreName nodeCoreName in this.routineNodePolusPairs[ routinePolusName ] )
                            {
                            this.baseNode.SendMessageVia( message, nodeCoreName, this.SystemTime );
                            }
                }
            }


        /// <summary>
        /// ������� ��������� ����� ��� ������
        /// </summary>
        protected void SendMessageViaAllPoluses( string message )
            {
            foreach ( CoreName routinePolusName in this.routineNodePolusPairs.Keys )
                {
                SendMessageVia( message, routinePolusName );
                }
            }


        /// <summary>
        /// ������� ��������� ����� �������� �������
        /// </summary>
        /// <param name="message">���������</param>
        /// <param name="routineCoreNameRange">�������� ������� ������, ����� ������� ���������� ���������</param>
        protected void SendMessageVia( string message, CoreNameRange routineCoreNameRange )
            {
            foreach ( CoreName routineCoreName in routineCoreNameRange )
                {
                SendMessageVia( message, routineCoreName );
                }
            }


        /// <summary>
        /// �������� ������ ������
        /// </summary>
        /// <param name="polusName">��� ������</param>
        /// <returns>������ ������ ��� -1, ���� � ������ ��� ��������</returns>
        protected int GetPolusIndex( CoreName polusName )
            {
            if ( polusName.IsIndexed )
                return polusName.Indices[ 0 ];
            else
                return -1;
            }



        /// <summary>
        /// �������� ��������� ����� �����
        /// </summary>
        /// <param name="nodePolusName">��� ������ �������</param>
        /// <param name="message">���������</param>
        /// <param name="sendMessageTime">����� ������� ���������</param>
        public void ReceiveMessage( CoreName nodePolusName, string message, double sendMessageTime )
            {
            //���� ����� ������� ������ � ������� ������
            if ( this.nodeRoutinePolusPairs.ContainsKey( nodePolusName ) )
                foreach ( CoreName routineCoreName in this.nodeRoutinePolusPairs[ nodePolusName ] )
                    {
                    //��������� ������� ������ ��������� (���������� �� ����, ������������ ��� ��� �����)
                    ReceivingMessageEvent ev = new ReceivingMessageEvent( sendMessageTime, 
                        this, routineCoreName, nodePolusName, message );
                    ev.OnEventFunction += this.ReceiveMessageHandler;

                    //��������� ����������� ������ ���������
                    if ( this.spyHandlerList.ContainsKey( nodePolusName ) )
                        foreach ( SpyHandler handler in this.spyHandlerList[ nodePolusName ] )
                            {
                            ev.EventSpyHandler += handler;
                            }
                    
                    this.eventCalendar.PlaneEvent( ev );
                    }
            }


        /// <summary>
        /// ���������� ������ ���������
        /// ����� ���������� �����, ����� ��������� ����������������� ������
        /// � ������ ������ ���������� ������� (� �� � ������� ReceiveMessage)
        /// </summary>
        /// <param name="routinePolusName">��� ������, ���������� ���������</param>
        /// <param name="nodePolusName">��� ������ �������, ���������� ���������</param>
        /// <param name="message">���������</param>
        /// <param name="spyHandler">����������� �������� ���������</param>
        private void ReceiveMessageHandler( CoreName routinePolusName, CoreName nodePolusName,
            string message, SpyHandler spyHandler )
            {
            //���� ����� ������ �� ��������� � ������ ���������������
            if ( !this.routineBlockedPolusList.Contains( routinePolusName ) )
                {
                ReceiveMessageVia( routinePolusName, message );

                //�������� �������������� ���������, �������� �� ��������� ���������
                if ( spyHandler != null )
                    {
                    SpyObject spyPolus = new SpyPolus( nodePolusName, this );
                    spyPolus.Data = message;
                    spyHandler( spyPolus, this.SystemTime );
                    }
                }
            }


        /// <summary>
        /// ���������������� ���������� ���������
        /// </summary>
        /// <param name="polusName">��� ������ ��� ������� �������</param>
        /// <param name="message">���������</param>
        protected virtual void ReceiveMessageVia( CoreName polusName, string message )
            {
            //������ �� ������
            }


        /// <summary>
        /// �������� �� ������������� ������
        /// </summary>
        public virtual void DoInitialize()
            {
            //������ �� ������
            }

        
        /// <summary>
        /// �������� �� ������������� ������
        /// </summary>
        /// <param name="baseNode">������������ �������</param>
        public void Initialize( Node baseNode )
            {
            this.baseNode = baseNode;
            }


        /// <summary>
        /// �������� �����
        /// </summary>
        /// <returns></returns>
        public new Routine Clone()
            {
            Routine newRoutine = base.Clone() as Routine;

            //� ����� ������ ���� ���� ��������� �������
            newRoutine.eventCalendar = new Calendar();

            //�������� ������ ��������������� �������
            newRoutine.routineBlockedPolusList = new List<CoreName>();
            foreach ( CoreName coreName in this.routineBlockedPolusList )
                newRoutine.routineBlockedPolusList.Add( coreName );

            //**********************************************************
            //������ ������������ � ������������� ����� ���� ���� �����������,
            //�.�. ������ ����� ������������� ��������� ��� � ������� ��������������
            //**********************************************************
            newRoutine.routineNodePolusPairs = new SortedList<CoreName, List<CoreName>>();
            foreach ( KeyValuePair<CoreName, List<CoreName>> pair in this.routineNodePolusPairs )
                newRoutine.routineNodePolusPairs.Add( pair.Key, pair.Value );
            
            newRoutine.nodeRoutinePolusPairs = new SortedList<CoreName, List<CoreName>>();
            foreach ( KeyValuePair<CoreName, List<CoreName>> pair in this.nodeRoutinePolusPairs )
                newRoutine.nodeRoutinePolusPairs.Add( pair.Key, pair.Value );

            return newRoutine;
            }


        /// <summary>
        /// �������� ������������ ����� ������ ������ � ������� � � ������
        /// </summary>
        /// <param name="routinePolusName">��� ������ � ������</param>
        /// <param name="nodePolusName">��� ������ � �������</param>
        public void AddPolusPair( CoreName routinePolusName, CoreName nodePolusName )
            {
            if ( !this.nodeRoutinePolusPairs.ContainsKey( nodePolusName ) )
                this.nodeRoutinePolusPairs.Add( nodePolusName, new List<CoreName>() );
            this.nodeRoutinePolusPairs[ nodePolusName ].Add( routinePolusName );

            if ( !this.routineNodePolusPairs.ContainsKey( routinePolusName ) )
                this.routineNodePolusPairs.Add( routinePolusName, new List<CoreName>() );
            this.routineNodePolusPairs[ routinePolusName ].Add( nodePolusName );
            }


        /// <summary>
        /// �������� ������������ ����� ������� ������ � ������ ������� ������� �� ������
        /// </summary>
        /// <param name="routinePolusName">����� ������</param>
        /// <param name="nodePolusNameRange">������ ������� �������</param>
        public void AddPolusPair( CoreName routinePolusName, CoreNameRange nodePolusNameRange )
            {
            foreach ( CoreName nodePolusName in nodePolusNameRange )
                AddPolusPair( routinePolusName, nodePolusName );
            }


        /// <summary>
        /// �������� ������������ ����� ������ ������� ������ �� ������ � ������� �������
        /// </summary>
        /// <param name="routinePolusNameRange">������ ������� ������</param>
        /// <param name="nodePolusName">����� �������</param>
        public void AddPolusPair( CoreNameRange routinePolusNameRange, CoreName nodePolusName )
            {
            foreach ( CoreName routinePolusName in routinePolusNameRange )
                AddPolusPair( routinePolusName, nodePolusName );
            }


        /// <summary>
        /// �������� ������������ ����� �������� ������� ������ � �������
        /// </summary>
        /// <param name="routinePolusNameRange"></param>
        /// <param name="nodePolusNameRange"></param>
        public void AddPolusPair( CoreNameRange routinePolusNameRange, CoreNameRange nodePolusNameRange )
            {
            for ( int index = 0 ; index < routinePolusNameRange.ItemCount ; index++ )
                {
                if ( index >= nodePolusNameRange.ItemCount )
                    break;

                AddPolusPair( routinePolusNameRange[ index ], nodePolusNameRange[ index ] );
                }
            }



        /// <summary>
        /// �������� ������ ������������ ����� ������� ������� � ��������� � � ������
        /// </summary>
        public void ClearPolusPairList()
            {
            this.routineNodePolusPairs.Clear();
            this.nodeRoutinePolusPairs.Clear();
            }

        
        /// <summary>
        /// ��������� �����
        /// </summary>
        protected override double SystemTime
            {
            get
                {
                return this.eventCalendar.SystemTime;
                }
            }   
        

        
        /// <summary>
        /// ������������� ����� ��� �������/�������� ���������
        /// </summary>
        /// <param name="routinePolusName">��� ������ � ������</param>
        public void BlockPolus( CoreName routinePolusName )
            {
            if ( !this.routineBlockedPolusList.Contains( routinePolusName ) )
                this.routineBlockedPolusList.Add( routinePolusName );
            }


        /// <summary>
        /// ������������� ����� ��� �������/�������� ���������
        /// </summary>
        /// <param name="routineNameRange">�������� ���� ������� � ������</param>
        public void BlockPolus( CoreNameRange routineNameRange )
            {
            foreach( CoreName coreName in routineNameRange )
                {
                BlockPolus( coreName );
                }
            }


        /// <summary>
        /// ������������� ����� ��� �������/�������� ���������
        /// </summary>
        /// <param name="nodePolusName">��� ������ � �������</param>
        public void BlockNodePolus( CoreName nodePolusName )
            {
            if ( this.nodeRoutinePolusPairs.ContainsKey( nodePolusName ) )
                //��������� ��� ��������� � ������� ������� ������ ������
                foreach ( CoreName routinePolusName in this.nodeRoutinePolusPairs[ nodePolusName ] )
                    BlockPolus( routinePolusName );
            }


        /// <summary>
        /// �������������� ����� ��� �������/�������� ���������
        /// </summary>
        /// <param name="routinePolusName">��� ������ ������</param>
        public void UnblockPolus( CoreName routinePolusName )
            {
            if ( this.routineBlockedPolusList.Contains( routinePolusName ) )
                this.routineBlockedPolusList.Remove( routinePolusName );            
            }


        /// <summary>
        /// �������������� ����� ��� �������/�������� ���������
        /// </summary>
        /// <param name="routineNameRange">�������� ���� ������� ������</param>
        public void UnblockPolus( CoreNameRange routineNameRange )
            {
            foreach ( CoreName coreName in routineNameRange )
                {
                UnblockPolus( coreName );
                }
            }


        /// <summary>
        /// �������������� ����� ��� �������/�������� ���������
        /// </summary>
        /// <param name="nodePolusName">��� ������ �������</param>
        public void UnblockNodePolus( CoreName nodePolusName )
            {
            if ( this.nodeRoutinePolusPairs.ContainsKey( nodePolusName ) )
                //����������� ��� ��������� � ������� ������� ������ ������
                foreach ( CoreName routinePolusName in this.nodeRoutinePolusPairs[ nodePolusName ] )
                    UnblockPolus( routinePolusName );
            }


        /// <summary>
        /// ���������� ������
        /// </summary>
        /// <param name="message">���������</param>
        protected void PrintMessage( object message )
            {
                if ( message != null )
                {
                    if (this.baseNode != null)
                    {
                        Console.WriteLine("{0,-12} {1,-6} {2} ", this.baseNode, this.SystemTime, message);
                        Logger.Instance.AddRecord(new LoggerRecord(SystemTime, this.baseNode.ToString(), message.ToString()));
                    }
                }
            }


        
        /// <summary>
        /// ��������� ������� ������
        /// </summary>
        public Calendar EventCalendar
            {
            get
                {
                return eventCalendar;
                }
            }


        /// <summary>
        /// �������, ���������� ������
        /// </summary>
        private Node baseNode = null;
        /// <summary> 
        /// ��������� �������
        /// </summary>
        private Calendar eventCalendar = new Calendar();

        /// <summary>
        /// ������ ������������ ����: Key - ��� ������ � ������; Value - ����� ��������� � ��� ������� � �������
        /// </summary>
        private SortedList<CoreName, List<CoreName>> routineNodePolusPairs = new SortedList<CoreName, List<CoreName>>();
        /// <summary>
        /// ������ ������������ ����: Key - ��� ������ � �������; Value - ����� ��������� � ��� ������� � ������
        /// </summary>
        private SortedList<CoreName, List<CoreName>> nodeRoutinePolusPairs = new SortedList<CoreName, List<CoreName>>();
        /// <summary>
        /// ������ ��������������� ��� �������/�������� ��������� ������� ������
        /// </summary>
        private List<CoreName> routineBlockedPolusList = new List<CoreName>();
        }
    }
